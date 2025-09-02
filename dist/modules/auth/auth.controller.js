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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const signup_dto_1 = require("./dto/signup.dto");
const verify_otp_dto_1 = require("./dto/verify-otp.dto");
const set_password_dto_1 = require("./dto/set-password.dto");
const signin_dto_1 = require("./dto/signin.dto");
const refresh_token_dto_1 = require("./dto/refresh-token.dto");
const access_token_guard_1 = require("./guards/access-token.guard");
const refresh_token_guard_1 = require("./guards/refresh-token.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async signup(dto) {
        return this.authService.signup(dto);
    }
    async verifyOtp(dto) {
        return this.authService.verifyOtp(dto);
    }
    async setPassword(dto) {
        if (dto.password !== dto.confirmPassword) {
            throw new common_1.BadRequestException('Passwords do not match');
        }
        return this.authService.setPassword(dto);
    }
    async signin(dto, req) {
        var _a;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        try {
            const result = await this.authService.signin(dto);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async signinVerifyOtp(dto, req) {
        var _a;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        return this.authService.signinVerifyOtp(dto, {
            ipAddress,
            userAgent,
            deviceName: null,
            location: null,
        });
    }
    async refresh(dto, req) {
        var _a;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        return this.authService.refresh(dto);
    }
    async test(req) {
        var _a;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        return {
            message: 'Server is working',
            timestamp: new Date().toISOString(),
            clientInfo: {
                ipAddress,
                userAgent: userAgent.substring(0, 100)
            }
        };
    }
    async getMe(req) {
        var _a;
        const userId = req.user.sub;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        return this.authService.getUserProfile(userId);
    }
    async getSessions(req) {
        const userId = req.user.sub;
        return this.authService.getUserSessions(userId);
    }
    async revokeSession(req, sessionId) {
        const userId = req.user.sub;
        return this.authService.revokeSession(userId, sessionId);
    }
    async generate2FA(req) {
        var _a;
        const userId = req.user.sub;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        if (!userId) {
            throw new common_1.BadRequestException('User not found');
        }
        return this.authService.generate2FASecret(userId);
    }
    async verify2FA(req, token) {
        var _a;
        const userId = req.user.sub;
        const ipAddress = req.ip || ((_a = req.socket) === null || _a === void 0 ? void 0 : _a.remoteAddress) || null;
        const userAgent = req.headers['user-agent'] || null;
        if (!token) {
            throw new common_1.BadRequestException('Missing token');
        }
        const isValid = await this.authService.verify2FA(userId, token);
        if (!isValid) {
            throw new common_1.BadRequestException('Invalid 2FA token');
        }
        return { success: true, message: 'Two-factor authentication verified' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('set-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [set_password_dto_1.SetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setPassword", null);
__decorate([
    (0, common_1.Post)('signin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SigninDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Post)('signin/verify-otp'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signinVerifyOtp", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(refresh_token_guard_1.RefreshTokenGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('test'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "test", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSessions", null);
__decorate([
    (0, common_1.Post)('sessions/:sessionId/revoke'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Post)('2fa/generate'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generate2FA", null);
__decorate([
    (0, common_1.Post)('2fa/verify'),
    (0, common_1.UseGuards)(access_token_guard_1.AccessTokenGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify2FA", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map