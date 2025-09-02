
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';

import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';

import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';


@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	private async sendOtpEmail(email: string, otp: string) {
		/* Debug: Log the credentials being used (remove this in production)
		console.log('GMAIL_USER:', process.env.GMAIL_USER);
		console.log('GMAIL_PASS length:', process.env.GMAIL_PASS?.length);
		console.log('GMAIL_PASS (first 4 chars):', process.env.GMAIL_PASS?.substring(0, 4));*/
		
		const transporter = nodemailer.createTransport({
			host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
			port: parseInt(process.env.GMAIL_SMTP_PORT || '587', 10),
			secure: false, // true for 465, false for other ports
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_PASS,
			},
			tls: {
				rejectUnauthorized: false
			}
		});
		
		// Verify transporter configuration
		try {
			await transporter.verify();
			console.log('SMTP connection verified successfully');
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

	async signup(dto: SignupDto) {
		let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) {
			user = await this.prisma.user.create({ 
				data: { 
					email: dto.email,
					updatedAt: new Date()
				} 
			});
		}
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
		await this.prisma.otp.create({
			data: {
				userId: user.id,
				otpHash,
				expiresAt,
			},
		});
		await this.sendOtpEmail(dto.email, otp);
		return { message: 'OTP sent to email' };
	}

	async verifyOtp(dto: VerifyOtpDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) throw new BadRequestException('User not found');
		const otps = await this.prisma.otp.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 1
		});
		const latestOtp = otps[0];
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
		const otps = await this.prisma.otp.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 1
		});
		const latestOtp = otps[0];
		if (!latestOtp) throw new BadRequestException('No OTP found');
		if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
		const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
		if (!valid) throw new BadRequestException('Invalid OTP');
		const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
		await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash, isVerified: true } });
		return { message: 'Password set successfully' };
	}

	async signin(dto: SigninDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user || !user.isVerified) throw new BadRequestException('User not found or not verified');
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
		const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
		await this.prisma.otp.create({
			data: {
				userId: user.id,
				otpHash,
				expiresAt,
			},
		});
		await this.sendOtpEmail(dto.email, otp);
		return { message: 'OTP sent to email' };
	}

	async signinVerifyOtp(dto: VerifyOtpDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) throw new BadRequestException('User not found');
		const otps = await this.prisma.otp.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
			take: 1
		});
		const latestOtp = otps[0];
		if (!latestOtp) throw new BadRequestException('No OTP found');
		if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
		const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
		if (!valid) throw new BadRequestException('Invalid OTP');
		const accessToken = this.generateAccessToken(user.id);
		const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(user.id);
		await this.prisma.refreshToken.create({
			data: {
				userId: user.id,
				tokenHash: refreshTokenHash,
				expiresAt,
			},
		});
		return {
			accessToken,
			refreshToken,
			expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '600', 10),
		};
	}

	private generateAccessToken(userId: number) {
		const payload = { sub: userId };
		const secret = process.env.JWT_SECRET || 'changeme';
		const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '600';
		return jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
	}

	private async generateRefreshToken(userId: number) {
		const payload = { sub: userId, rand: Math.random().toString(36).slice(2) };
		const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
		const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || (7 * 24 * 60 * 60).toString();
		const refreshToken = jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
		return {
			refreshToken,
			refreshTokenHash: await argon2.hash(refreshToken, { type: argon2.argon2id }),
			expiresAt: new Date(Date.now() + Number(expiresIn) * 1000),
		};
	}
    	async refresh(dto: RefreshTokenDto) {
		const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
		let payload: any;
		try {
			payload = jwt.verify(dto.refreshToken, secret);
		} catch (e) {
			throw new BadRequestException('Invalid refresh token');
		}
		const userId = payload.sub;
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw new BadRequestException('User not found');
		// Find the refresh token in DB and check if not revoked and not expired
		const tokens = await this.prisma.refreshToken.findMany({ where: { userId, revoked: false } });
		let found = false;
		let dbTokenId = null;
		for (const token of tokens) {
			if (await argon2.verify(token.tokenHash, dto.refreshToken)) {
				found = true;
				dbTokenId = token.id;
				if (token.expiresAt < new Date()) throw new BadRequestException('Refresh token expired');
				break;
			}
		}
		if (!found) throw new BadRequestException('Refresh token not found or revoked');
		// Revoke the old refresh token
		if (dbTokenId !== null) {
			await this.prisma.refreshToken.update({ where: { id: dbTokenId }, data: { revoked: true } });
		}
		// Issue new tokens
		const accessToken = this.generateAccessToken(userId);
		const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(userId);
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
			expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '600', 10),
		};
	}
	async generate2FASecret(userId: number) {
  const secret = speakeasy.generateSecret({
    name: 'M-Commerce SaaS',
  });

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
  console.log('AuthService.verify2FA called with userId:', userId, 'token:', token);
  
  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  console.log('User found:', user ? `${user.email} (otpEnabled: ${user.otpEnabled})` : 'null');

  if (!user?.otpSecret) {
    console.log('2FA not set up - missing otpSecret');
    throw new Error('2FA not set up');
  }

  const verified = speakeasy.totp.verify({
    secret: user.otpSecret,
    encoding: 'base32',
    token,
    window: 1,
  });
  
  console.log('TOTP verification result:', verified);

  if (verified) {
    console.log('Updating user otpEnabled to true...');
    await this.prisma.user.update({
      where: { id: userId },
      data: { otpEnabled: true },
    });
    console.log('User otpEnabled updated successfully');
  }

  return verified;
}

async getUserProfile(userId: number) {
  const user = await this.prisma.user.findUnique({ 
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isVerified: true,
      otpEnabled: true,
      otpSecret: false, // Don't expose the secret
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw new BadRequestException('User not found');
  }

  return { user };
}
}
