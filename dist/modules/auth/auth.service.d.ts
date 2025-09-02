import { PrismaService } from '../../prisma.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    private sendOtpEmail;
    signup(dto: SignupDto): Promise<{
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        message: string;
    }>;
    setPassword(dto: SetPasswordDto): Promise<{
        message: string;
    }>;
    signin(dto: SigninDto): Promise<{
        message: string;
    }>;
    signinVerifyOtp(dto: VerifyOtpDto, opts?: {
        ipAddress?: string | null;
        userAgent?: string | null;
        deviceName?: string | null;
        location?: string | null;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string;
        expiresIn: number;
        device: {
            id: number;
        } | null;
        session: {
            sessionId: string;
            ipAddress: string | null;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
            createdAt: Date;
            lastActive: Date;
            expiresAt: Date;
            id: number;
            userId: number;
            deviceId: number | null;
        };
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        sessionId: string | undefined;
        expiresIn: number;
    }>;
    generate2FASecret(userId: number): Promise<{
        qrCodeDataURL: string;
    }>;
    verify2FA(userId: number, token: string): Promise<boolean>;
    getUserProfile(userId: number): Promise<{
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
    getUserSessions(userId: number): Promise<{
        sessions: ({
            device: {
                deviceName: string | null;
                id: number;
                lastSeen: Date;
            } | null;
        } & {
            sessionId: string;
            ipAddress: string | null;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
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
    revokeSession(userId: number, sessionId: string): Promise<{
        message: string;
    }>;
    private createDeviceAndSession;
}
