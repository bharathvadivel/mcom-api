import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(dto: SignupDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
    }>;
    setPassword(dto: SetPasswordDto): Promise<{
        message: string;
    }>;
    signin(dto: SigninDto, req: FastifyRequest): Promise<{
        message: string;
    }>;
    signinVerifyOtp(dto: VerifyOtpDto, req: FastifyRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        expiresIn: number;
        device: {
            id: number;
        } | null;
        session: {
            ipAddress: string | null;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
            sessionId: string;
            createdAt: Date;
            lastActive: Date;
            expiresAt: Date;
            id: number;
            userId: number;
            deviceId: number | null;
        };
    }>;
    refresh(dto: RefreshTokenDto, req: FastifyRequest): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string | undefined;
        expiresIn: number;
    }>;
    test(req: FastifyRequest): Promise<{
        message: string;
        timestamp: string;
        clientInfo: {
            ipAddress: string;
            userAgent: string;
        };
    }>;
    getMe(req: FastifyRequest): Promise<{
        user: {
            createdAt: Date;
            id: number;
            email: string;
            isVerified: boolean;
            updatedAt: Date;
            otpEnabled: boolean;
            lastLoginAt: Date | null;
            lastLoginIp: string | null;
        };
    }>;
    getSessions(req: FastifyRequest): Promise<{
        sessions: ({
            device: {
                deviceName: string | null;
                id: number;
                lastSeen: Date;
            } | null;
        } & {
            ipAddress: string | null;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
            sessionId: string;
            createdAt: Date;
            lastActive: Date;
            expiresAt: Date;
            id: number;
            userId: number;
            deviceId: number | null;
        })[];
        devices: {
            ipAddress: string | null;
            userAgent: string;
            deviceName: string | null;
            id: number;
            userId: number;
            firstSeen: Date;
            lastSeen: Date;
        }[];
    }>;
    revokeSession(req: FastifyRequest, sessionId: string): Promise<{
        message: string;
    }>;
    generate2FA(req: FastifyRequest): Promise<{
        qrCodeDataURL: string;
    }>;
    verify2FA(req: FastifyRequest, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
