import { PrismaService } from '../../prisma.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthService {
    private prisma;
    constructor(prisma: PrismaService);
    private processSessionId;
    private decryptSessionId;
    private hashIpAddress;
    private truncateIpAddress;
    private processIpAddress;
    private decryptIpAddress;
    getSessionInfo(sessionId: string): Promise<any>;
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
        sessionId: `${string}-${string}-${string}-${string}-${string}`;
        expiresIn: number;
        device: {
            id: number;
        } | null;
        session: {
            sessionId: `${string}-${string}-${string}-${string}-${string}`;
            encryptedSessionId: string;
            sessionIdHash: string;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
            createdAt: Date;
            lastActive: Date;
            expiresAt: Date;
            hashedIp: string | null;
            truncatedIp: string | null;
            encryptedIpAddress: string | null;
            id: number;
            userId: number;
            deviceId: number | null;
        };
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    refresh(dto: RefreshTokenDto, ipContext?: {
        ipAddress?: string | null;
        userAgent?: string | null;
    }): Promise<{
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
            lastLoginIp: string | null;
            encryptedLastLoginIp: undefined;
            createdAt: Date;
            id: number;
            email: string;
            isVerified: boolean;
            updatedAt: Date;
            otpEnabled: boolean;
            lastLoginAt: Date | null;
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
            encryptedSessionId: string;
            sessionIdHash: string;
            userAgent: string | null;
            deviceName: string | null;
            location: string | null;
            createdAt: Date;
            lastActive: Date;
            expiresAt: Date;
            hashedIp: string | null;
            truncatedIp: string | null;
            encryptedIpAddress: string | null;
            id: number;
            userId: number;
            deviceId: number | null;
        })[];
        devices: {
            userAgent: string;
            deviceName: string | null;
            hashedIp: string | null;
            truncatedIp: string | null;
            encryptedIpAddress: string | null;
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
