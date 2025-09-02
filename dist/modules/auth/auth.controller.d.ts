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
    signin(dto: SigninDto): Promise<{
        message: string;
    }>;
    signinVerifyOtp(dto: VerifyOtpDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    test(): Promise<{
        message: string;
        timestamp: string;
    }>;
    getMe(req: FastifyRequest): Promise<{
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
    generate2FA(req: FastifyRequest): Promise<{
        qrCodeDataURL: string;
    }>;
    verify2FA(req: FastifyRequest, token: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
