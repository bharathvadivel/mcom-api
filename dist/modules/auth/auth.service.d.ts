import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { PrismaService } from '../../prisma.service';
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
    signinVerifyOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    private generateAccessToken;
    private generateRefreshToken;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    generate2FASecret(userId: number): Promise<{
        qrCodeDataURL: string;
    }>;
    verify2FA(userId: number, token: string): Promise<boolean>;
    getUserProfile(userId: number): Promise<{
        user: {
            id: number;
            email: string;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            otpEnabled: boolean;
            lastLoginAt: Date | null;
        };
    }>;
}
