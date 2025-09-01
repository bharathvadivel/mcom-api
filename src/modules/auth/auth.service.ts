
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';


@Injectable()
export class AuthService {
	constructor(private prisma: PrismaService) {}

	async signup(dto: SignupDto) {
		let user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) {
			user = await this.prisma.user.create({ data: { email: dto.email } });
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
		console.log(`OTP for ${dto.email}: ${otp}`);
		return { message: 'OTP sent to email' };
	}

	async verifyOtp(dto: VerifyOtpDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
		if (!user) throw new BadRequestException('User not found');
		const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
		if (!latestOtp) throw new BadRequestException('No OTP found');
		if (latestOtp.expiresAt < new Date()) throw new BadRequestException('OTP expired');
		const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
		if (!valid) throw new BadRequestException('Invalid OTP');
		await this.prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
		return { message: 'OTP verified' };
	}

	async setPassword(dto: SetPasswordDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
		if (!user) throw new BadRequestException('User not found');
		const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
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
		console.log(`Signin OTP for ${dto.email}: ${otp}`);
		return { message: 'OTP sent to email' };
	}

	async signinVerifyOtp(dto: VerifyOtpDto) {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
		if (!user) throw new BadRequestException('User not found');
		const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
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
}
