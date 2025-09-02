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
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const ua_parser_helper_1 = require("../../utils/ua-parser.helper");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async hashSessionId(sessionId) {
        return await argon2.hash(sessionId, { type: argon2.argon2id });
    }
    hashIpAddress(ipAddress) {
        if (!ipAddress)
            return '';
        return crypto.createHash('sha256').update(ipAddress).digest('hex');
    }
    truncateIpAddress(ipAddress) {
        if (!ipAddress)
            return '';
        if (ipAddress.includes('.')) {
            const parts = ipAddress.split('.');
            if (parts.length === 4) {
                return `${parts[0]}.${parts[1]}.0.0`;
            }
        }
        if (ipAddress.includes(':')) {
            const parts = ipAddress.split(':');
            if (parts.length >= 4) {
                return `${parts[0]}:${parts[1]}:${parts[2]}:${parts[3]}::`;
            }
        }
        return ipAddress;
    }
    processIpAddress(ipAddress) {
        if (!ipAddress) {
            return { hashedIp: '', truncatedIp: '' };
        }
        return {
            hashedIp: this.hashIpAddress(ipAddress),
            truncatedIp: this.truncateIpAddress(ipAddress)
        };
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
            tls: { rejectUnauthorized: false },
        });
        try {
            await transporter.verify();
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
    async verifyOtp(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = await this.prisma.otp.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
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
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = await this.prisma.otp.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!latestOtp)
            throw new common_1.BadRequestException('No OTP found');
        if (latestOtp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
        const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash, isVerified: true },
        });
        return { message: 'Password set successfully' };
    }
    async signin(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user || !user.isVerified) {
            throw new common_1.BadRequestException('User not found or not verified');
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await argon2.hash(otp, { type: argon2.argon2id });
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        try {
            await this.prisma.otp.create({
                data: { userId: user.id, otpHash, expiresAt },
            });
            await this.sendOtpEmail(dto.email, otp);
            return { message: 'OTP sent to email' };
        }
        catch (error) {
            throw error;
        }
    }
    async signinVerifyOtp(dto, opts) {
        var _a, _b, _c, _d, _e, _f, _g;
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const latestOtp = await this.prisma.otp.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        if (!latestOtp)
            throw new common_1.BadRequestException('No OTP found');
        if (latestOtp.expiresAt < new Date())
            throw new common_1.BadRequestException('OTP expired');
        const valid = await argon2.verify(latestOtp.otpHash, dto.otp);
        if (!valid)
            throw new common_1.BadRequestException('Invalid OTP');
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: (opts === null || opts === void 0 ? void 0 : opts.ipAddress) || null
            },
        });
        const { session, device, } = await this.createDeviceAndSession(user.id, {
            ipAddress: (_a = opts === null || opts === void 0 ? void 0 : opts.ipAddress) !== null && _a !== void 0 ? _a : null,
            userAgent: (_b = opts === null || opts === void 0 ? void 0 : opts.userAgent) !== null && _b !== void 0 ? _b : null,
            deviceName: (_c = opts === null || opts === void 0 ? void 0 : opts.deviceName) !== null && _c !== void 0 ? _c : null,
            location: (_d = opts === null || opts === void 0 ? void 0 : opts.location) !== null && _d !== void 0 ? _d : null,
        });
        const accessToken = this.generateAccessToken(user.id, session.sessionId);
        const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(user.id, session.sessionId);
        const processedIp = this.processIpAddress((_e = opts === null || opts === void 0 ? void 0 : opts.ipAddress) !== null && _e !== void 0 ? _e : null);
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                deviceInfo: device ? `Device ID: ${device.id}` : null,
                ipAddress: (_f = opts === null || opts === void 0 ? void 0 : opts.ipAddress) !== null && _f !== void 0 ? _f : null,
                hashedIp: processedIp.hashedIp || null,
                truncatedIp: processedIp.truncatedIp || null,
                userAgent: (_g = opts === null || opts === void 0 ? void 0 : opts.userAgent) !== null && _g !== void 0 ? _g : null,
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
    generateAccessToken(userId, sessionId) {
        const payload = { sub: userId };
        if (sessionId)
            payload.sessionId = sessionId;
        const secret = process.env.JWT_SECRET || 'changeme';
        const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '600';
        return jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
    }
    async generateRefreshToken(userId, sessionId) {
        const payload = { sub: userId, rand: crypto.randomBytes(8).toString('hex') };
        if (sessionId)
            payload.sessionId = sessionId;
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
        const expiresInSec = Number(process.env.JWT_REFRESH_EXPIRES_IN) || 7 * 24 * 60 * 60;
        const refreshToken = jwt.sign(payload, secret, { expiresIn: expiresInSec });
        return {
            refreshToken,
            refreshTokenHash: await argon2.hash(refreshToken, { type: argon2.argon2id }),
            expiresAt: new Date(Date.now() + expiresInSec * 1000),
        };
    }
    async refresh(dto, ipContext) {
        var _a, _b, _c;
        const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'changeme';
        let payload;
        try {
            payload = jwt.verify(dto.refreshToken, secret);
        }
        catch (_d) {
            throw new common_1.BadRequestException('Invalid refresh token');
        }
        const userId = payload.sub;
        const sessionId = payload.sessionId;
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revoked: false },
        });
        let matchTokenId = null;
        for (const token of tokens) {
            const ok = await argon2.verify(token.tokenHash, dto.refreshToken);
            if (ok) {
                if (token.expiresAt < new Date())
                    throw new common_1.BadRequestException('Refresh token expired');
                matchTokenId = token.id;
                break;
            }
        }
        if (matchTokenId == null)
            throw new common_1.BadRequestException('Refresh token not found or revoked');
        await this.prisma.refreshToken.update({
            where: { id: matchTokenId },
            data: { revoked: true },
        });
        if (sessionId) {
            await this.prisma.session.updateMany({
                where: { sessionId },
                data: { lastActive: new Date() },
            });
        }
        const accessToken = this.generateAccessToken(userId, sessionId);
        const { refreshToken, refreshTokenHash, expiresAt } = await this.generateRefreshToken(userId, sessionId);
        const processedIp = this.processIpAddress((_a = ipContext === null || ipContext === void 0 ? void 0 : ipContext.ipAddress) !== null && _a !== void 0 ? _a : null);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                tokenHash: refreshTokenHash,
                ipAddress: (_b = ipContext === null || ipContext === void 0 ? void 0 : ipContext.ipAddress) !== null && _b !== void 0 ? _b : null,
                hashedIp: processedIp.hashedIp || null,
                truncatedIp: processedIp.truncatedIp || null,
                userAgent: (_c = ipContext === null || ipContext === void 0 ? void 0 : ipContext.userAgent) !== null && _c !== void 0 ? _c : null,
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
    async generate2FASecret(userId) {
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
    async verify2FA(userId, token) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!(user === null || user === void 0 ? void 0 : user.otpSecret))
            throw new Error('2FA not set up');
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
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                isVerified: true,
                otpEnabled: true,
                lastLoginAt: true,
                lastLoginIp: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        return { user };
    }
    async getUserSessions(userId) {
        const sessions = await this.prisma.session.findMany({
            where: {
                userId,
                expiresAt: { gt: new Date() }
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
            take: 10
        });
        return { sessions, devices };
    }
    async revokeSession(userId, sessionId) {
        const session = await this.prisma.session.findFirst({
            where: { userId, sessionId }
        });
        if (!session)
            throw new common_1.BadRequestException('Session not found');
        await this.prisma.session.update({
            where: { id: session.id },
            data: { expiresAt: new Date() }
        });
        await this.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true }
        });
        return { message: 'Session revoked successfully' };
    }
    async createDeviceAndSession(userId, ctx) {
        var _a, _b, _c, _d;
        const ipAddress = (_a = ctx.ipAddress) !== null && _a !== void 0 ? _a : null;
        const userAgent = (_b = ctx.userAgent) !== null && _b !== void 0 ? _b : null;
        const location = (_c = ctx.location) !== null && _c !== void 0 ? _c : null;
        const processedIp = this.processIpAddress(ipAddress);
        let device = null;
        let parsedDeviceName = ctx.deviceName;
        if (userAgent) {
            const ua = (0, ua_parser_helper_1.parseUserAgent)(userAgent);
            parsedDeviceName = parsedDeviceName || ua.deviceName;
        }
        if (userAgent || ipAddress) {
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
                    hashedIp: processedIp.hashedIp || undefined,
                    truncatedIp: processedIp.truncatedIp || undefined,
                },
                create: {
                    userId,
                    deviceName: parsedDeviceName || 'Unknown Device',
                    userAgent: userAgent || '',
                    ipAddress: ipAddress || null,
                    hashedIp: processedIp.hashedIp || null,
                    truncatedIp: processedIp.truncatedIp || null,
                    firstSeen: new Date(),
                    lastSeen: new Date(),
                },
                select: { id: true },
            });
        }
        const rawSessionId = crypto.randomUUID();
        const hashedSessionIdForLogging = await this.hashSessionId(rawSessionId);
        const session = await this.prisma.session.create({
            data: {
                userId,
                sessionId: rawSessionId,
                sessionIdHash: hashedSessionIdForLogging,
                hashedIp: processedIp.hashedIp || null,
                truncatedIp: processedIp.truncatedIp || null,
                ipAddress: ipAddress !== null && ipAddress !== void 0 ? ipAddress : null,
                userAgent: userAgent !== null && userAgent !== void 0 ? userAgent : null,
                deviceName: parsedDeviceName !== null && parsedDeviceName !== void 0 ? parsedDeviceName : null,
                location: location !== null && location !== void 0 ? location : null,
                deviceId: (_d = device === null || device === void 0 ? void 0 : device.id) !== null && _d !== void 0 ? _d : null,
                createdAt: new Date(),
                lastActive: new Date(),
                expiresAt: new Date(Date.now() +
                    (Number(process.env.SESSION_TTL_SECONDS) || 7 * 24 * 60 * 60) * 1000),
            },
        });
        return {
            session: Object.assign(Object.assign({}, session), { sessionId: rawSessionId }),
            device: device ? { id: device.id } : null
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map