import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { parseUserAgent } from '../../utils/ua-parser.helper';

import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // ---------------------------
  // Email delivery (OTP)
  // ---------------------------
  private async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.GMAIL_SMTP_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Gmail App Password (not your main password)
      },
      tls: { rejectUnauthorized: false },
    });

    try {
      await transporter.verify();
      // console.log('SMTP connection verified successfully');
    } catch (error) {
      console.error('SMTP verification failed:', error);
      throw new BadRequestException('Email service configuration error');
    }

    const appName = process.env.GMAIL_APP_NAME || 'Your App';
    await transporter.sendMail({
      from: `"${appName}" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${appName} OTP Verification`,
      text: `Your OTP code is: ${otp}\nThis code will expire in 10 minutes.`,
      html: `<p>Your OTP code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
    });
  }

  // ---------------------------
  // Signup / OTP / Password
  // ---------------------------
  async signup(dto: SignupDto) {
    let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          updatedAt: new Date(),
        },
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.otp.create({
      data: { userId: user.id, otpHash, expiresAt },
    });

    await this.sendOtpEmail(dto.email, otp);
    return { message: 'OTP sent to email' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');

    const latestOtp = await this.prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latestOtp) throw new BadRequestException('No OTP found');
    if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
    if (!valid) throw new BadRequestException('Invalid OTP');

    await this.prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    return { message: 'OTP verified' };
  }

  async setPassword(dto: SetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');

    const latestOtp = await this.prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latestOtp) throw new BadRequestException('No OTP found');
    if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
    if (!valid) throw new BadRequestException('Invalid OTP');

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, isVerified: true },
    });

    return { message: 'Password set successfully' };
  }

  // ---------------------------
  // Signin flow (email -> OTP)
  // ---------------------------
  async signin(dto: SigninDto) {
    // console.log('AuthService signin called with:', { email: dto.email });
    
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // console.log('User lookup result:', { 
    //   found: !!user, 
    //   verified: user?.isVerified,
    //   email: dto.email 
    // });
    
    if (!user || !user.isVerified) {
      // console.error('Signin failed: User not found or not verified', {
      //   email: dto.email,
      //   userExists: !!user,
      //   isVerified: user?.isVerified
      // });
      throw new BadRequestException('User not found or not verified');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // console.log('Creating OTP for user:', { userId: user.id, email: dto.email });
    
    try {
      await this.prisma.otp.create({
        data: { userId: user.id, otpHash, expiresAt },
      });

      // console.log('Sending OTP email to:', dto.email);
      await this.sendOtpEmail(dto.email, otp);
      
      // console.log('Signin completed successfully for:', dto.email);
      return { message: 'OTP sent to email' };
    } catch (error) {
      // console.error('Error during signin process:', {
      //   email: dto.email,
      //   error: error instanceof Error ? error.message : String(error)
      // });
      throw error;
    }
  }

  /**
   * Complete OTP signin:
   * - verifies OTP
   * - upserts a Device
   * - creates a Session
   * - issues access + rotating refresh tokens (with sessionId embedded)
   *
   * You can pass ip/userAgent/deviceName/location from your controller later.
   */
  async signinVerifyOtp(
    dto: VerifyOtpDto,
    opts?: {
      ipAddress?: string | null;
      userAgent?: string | null;
      deviceName?: string | null;
      location?: string | null;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new BadRequestException('User not found');

    const latestOtp = await this.prisma.otp.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    if (!latestOtp) throw new BadRequestException('No OTP found');
    if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');

    const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
    if (!valid) throw new BadRequestException('Invalid OTP');

    // Update last login timestamp and IP
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        lastLoginIp: opts?.ipAddress || null
      },
    });

    // console.log('Successful OTP signin:', {
    //   userId: user.id,
    //   email: user.email,
    //   ipAddress: opts?.ipAddress,
    //   userAgent: opts?.userAgent?.substring(0, 100),
    //   timestamp: new Date().toISOString()
    // });

    // Device + Session
    const {
      session,
      device,
    } = await this.createDeviceAndSession(user.id, {
      ipAddress: opts?.ipAddress ?? null,
      userAgent: opts?.userAgent ?? null,
      deviceName: opts?.deviceName ?? null,
      location: opts?.location ?? null,
    });

    // Tokens (embed sessionId)
    const accessToken = this.generateAccessToken(user.id, session.sessionId);
    const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(
      user.id,
      session.sessionId,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        // Optional: store device/session context on token row if you add columns
        // deviceInfo: device?.deviceName ?? null,
        // ipAddress: opts?.ipAddress ?? null,
        // userAgent: opts?.userAgent ?? null,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.sessionId,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '600', 10),
      device,
      session,
    };
  }

  // ---------------------------
  // Token helpers (include sessionId)
  // ---------------------------
  private generateAccessToken(userId: number, sessionId?: string) {
    const payload: Record<string, any> = { sub: userId };
    if (sessionId) payload.sessionId = sessionId;

    const secret = process.env.JWT_SECRET || 'changeme';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '600'; // seconds
    return jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
  }

  private async generateRefreshToken(userId: number, sessionId?: string) {
    const payload: Record<string, any> = { sub: userId, rand: crypto.randomBytes(8).toString('hex') };
    if (sessionId) payload.sessionId = sessionId;

    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
    const expiresInSec =
      Number(process.env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60; // default 7 days

    const refreshToken = jwt.sign(payload, secret, { expiresIn: expiresInSec });

    return {
      refreshToken,
      refreshTokenHash: await argon2.hash(refreshToken, { type: argon2.argon2id }),
      expiresAt: new Date(Date.now() + expiresInSec * 1000),
    };
  }

  // ---------------------------
  // Refresh (rotate) tokens
  // ---------------------------
  async refresh(dto: RefreshTokenDto) {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
    let payload: any;
    try {
      payload = jwt.verify(dto.refreshToken, secret);
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }

    const userId: number = payload.sub;
    const sessionId: string | undefined = payload.sessionId;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    // Find the refresh token in DB (not revoked + not expired) and verify hash
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });

    let matchTokenId: number | null = null;
    for (const token of tokens) {
      const ok = await argon2.verify(token.tokenHash, dto.refreshToken);
      if (ok) {
        if (token.expiresAt < new Date()) throw new BadRequestException('Refresh token expired');
        matchTokenId = token.id;
        break;
      }
    }

    if (matchTokenId == null) throw new BadRequestException('Refresh token not found or revoked');

    // Revoke the old refresh token
    await this.prisma.refreshToken.update({
      where: { id: matchTokenId },
      data: { revoked: true },
    });

    // Optionally update session lastActive if we have a sessionId
    if (sessionId) {
      await this.prisma.session.updateMany({
        where: { sessionId },
        data: { lastActive: new Date() },
      });
    }

    // Issue new tokens (rotation)
    const accessToken = this.generateAccessToken(userId, sessionId);
    const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(
      userId,
      sessionId,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      sessionId,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '600', 10),
    };
  }

  // ---------------------------
  // 2FA (TOTP) setup + verify
  // ---------------------------
  async generate2FASecret(userId: number) {
    const secret = speakeasy.generateSecret({ name: 'M-Commerce SaaS' });

    await this.prisma.user.update({
      where: { id: userId },
      data: { otpSecret: secret.base32 },
    });

    if (!secret.otpauth_url) {
      throw new Error('Failed to generate otpauth_url for 2FA secret');
    }

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
    return { qrCodeDataURL };
  }

  async verify2FA(userId: number, token: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.otpSecret) throw new Error('2FA not set up');

    const verified = speakeasy.totp.verify({
      secret: user.otpSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (verified) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { otpEnabled: true },
      });
    }

    return verified;
  }

  // ---------------------------
  // Profile (safe fields only)
  // ---------------------------
  async getUserProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isVerified: true,
        otpEnabled: true,
        // otpSecret: false, // (Prisma doesn't accept false inside select)
        lastLoginAt: true,
        lastLoginIp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');
    return { user };
  }

  /**
   * Get user's active sessions and devices for account management
   */
  async getUserSessions(userId: number) {
    const sessions = await this.prisma.session.findMany({
      where: { 
        userId,
        expiresAt: { gt: new Date() } // Only active sessions
      },
      include: {
        device: {
          select: {
            id: true,
            deviceName: true,
            lastSeen: true,
          }
        }
      },
      orderBy: { lastActive: 'desc' }
    });

    const devices = await this.prisma.device.findMany({
      where: { userId },
      orderBy: { lastSeen: 'desc' },
      take: 10 // Limit to last 10 devices
    });

    return { sessions, devices };
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: number, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: { userId, sessionId }
    });

    if (!session) throw new BadRequestException('Session not found');

    // Mark session as expired
    await this.prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: new Date() }
    });

    // Revoke all refresh tokens for this session
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true }
    });

    return { message: 'Session revoked successfully' };
  }

  // ---------------------------
  // Helpers: Device + Session
  // ---------------------------
  /**
   * Creates/updates a Device row and creates a Session row.
   * Returns both rows with improved user agent parsing.
   */
  private async createDeviceAndSession(
    userId: number,
    ctx: {
      ipAddress?: string | null;
      userAgent?: string | null;
      deviceName?: string | null;
      location?: string | null;
    },
  ) {
    const ipAddress = ctx.ipAddress ?? null;
    const userAgent = ctx.userAgent ?? null;
    const location = ctx.location ?? null;

    let device = null as null | { id: number };
    let parsedDeviceName = ctx.deviceName;

    // Parse user agent if available
    if (userAgent) {
      const ua = parseUserAgent(userAgent);
      parsedDeviceName = parsedDeviceName || ua.deviceName;
      
      // console.log('Parsed user agent:', {
      //   deviceName: ua.deviceName,
      //   browser: ua.browser,
      //   os: ua.os,
      //   deviceType: ua.deviceType
      // });
    }

    // Only upsert device if we have at least a userAgent or IP — otherwise skip
    if (userAgent || ipAddress) {
      // Use upsert for better device tracking
      device = await this.prisma.device.upsert({
        where: {
          userId_deviceName: {
            userId,
            deviceName: parsedDeviceName || 'Unknown Device',
          },
        },
        update: {
          lastSeen: new Date(),
          userAgent: userAgent || undefined,
          ipAddress: ipAddress || undefined,
        },
        create: {
          userId,
          deviceName: parsedDeviceName || 'Unknown Device',
          userAgent: userAgent || '',
          ipAddress: ipAddress || null,
          firstSeen: new Date(),
          lastSeen: new Date(),
        },
        select: { id: true },
      });
    }

    const session = await this.prisma.session.create({
      data: {
        userId,
        sessionId: crypto.randomUUID(),
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        deviceName: parsedDeviceName ?? null,
        location: location ?? null,
        deviceId: device?.id ?? null,
        createdAt: new Date(),
        lastActive: new Date(),
        // Example: 7 days — customize via env
        expiresAt: new Date(
          Date.now() +
            (Number(process.env.SESSION_TTL_SECONDS) || 7 * 24 * 60 * 60) * 1000,
        ),
      },
    });

    return { session, device: device ? { id: device.id } : null };
  }
}
