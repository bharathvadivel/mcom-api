"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async sendOtpEmail(email, otp) {
        const transporter = nodemailer.createTransport({
            host: process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.GMAIL_SMTP_PORT || '587', 10),
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        }
        catch (error) {
            console.error('SMTP verification failed:', error);
            throw new common_1.BadRequestException('Email service configuration error');
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
    async signup(dto) {
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
        await this.sendOtpEmail(dto.email, otp);
        return { message: 'OTP sent to email' };
    }
    async verifyOtp(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (!latestOtp)
            throw new common_1.BadRequestException('No OTP found');
        if (latestOtp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
        await this.prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
        return { message: 'OTP verified' };
    }
    async setPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (!latestOtp)
            throw new common_1.BadRequestException('No OTP found');
        if (latestOtp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
        const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
        await this.prisma.user.update({ where: { id: user.id }, data: { passwordHash, isVerified: true } });
        return { message: 'Password set successfully' };
    }
    async signin(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isVerified)
            throw new common_1.BadRequestException('User not found or not verified');
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
    async signinVerifyOtp(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email }, include: { otps: true } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = user.otps.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (!latestOtp)
            throw new common_1.BadRequestException('No OTP found');
        if (latestOtp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
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
    generateAccessToken(userId) {
        const payload = { sub: userId };
        const secret = process.env.JWT_SECRET || 'changeme';
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '600';
        return jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
    }
    async generateRefreshToken(userId) {
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
    async refresh(dto) {
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
        let payload;
        try {
            payload = jwt.verify(dto.refreshToken, secret);
        }
        catch (e) {
            throw new common_1.BadRequestException('Invalid refresh token');
        }
        const userId = payload.sub;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const tokens = await this.prisma.refreshToken.findMany({ where: { userId, revoked: false } });
        let found = false;
        let dbTokenId = null;
        for (const token of tokens) {
            if (await argon2.verify(token.tokenHash, dto.refreshToken)) {
                found = true;
                dbTokenId = token.id;
                if (token.expiresAt < new Date())
                    throw new common_1.BadRequestException('Refresh token expired');
                break;
            }
        }
        if (!found)
            throw new common_1.BadRequestException('Refresh token not found or revoked');
        if (dbTokenId !== null) {
            await this.prisma.refreshToken.update({ where: { id: dbTokenId }, data: { revoked: true } });
        }
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map