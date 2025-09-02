import { Controller, Post, Body, BadRequestException, UseGuards, Get, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { SigninDto } from './dto/signin.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post('signup')
	async signup(@Body() dto: SignupDto) {
		return this.authService.signup(dto);
	}

	@Post('verify-otp')
	async verifyOtp(@Body() dto: VerifyOtpDto) {
		return this.authService.verifyOtp(dto);
	}

	@Post('set-password')
	async setPassword(@Body() dto: SetPasswordDto) {
		if (dto.password !== dto.confirmPassword) {
			throw new BadRequestException('Passwords do not match');
		}
		return this.authService.setPassword(dto);
	}

	@Post('signin')
	async signin(@Body() dto: SigninDto, @Req() req: FastifyRequest) {
		const ipAddress = req.ip || req.socket?.remoteAddress || null;
		const userAgent = req.headers['user-agent'] || null;
		
		// console.log('Signin request received:', {
		// 	email: dto.email,
		// 	ipAddress,
		// 	userAgent: userAgent?.substring(0, 100),
		// 	timestamp: new Date().toISOString(),
		// 	body: dto
		// });
		
		try {
			const result = await this.authService.signin(dto);
			// console.log('Signin successful:', { email: dto.email, message: result.message });
			return result;
		} catch (error) {
			// console.error('Signin error:', {
			// 	email: dto.email,
			// 	error: error instanceof Error ? error.message : String(error),
			// 	stack: error instanceof Error ? error.stack : undefined,
			// 	timestamp: new Date().toISOString()
			// });
			throw error;
		}
	}

	@Post('signin/verify-otp')
	async signinVerifyOtp(@Body() dto: VerifyOtpDto, @Req() req: FastifyRequest) {
		const ipAddress = req.ip || req.socket?.remoteAddress || null;
		const userAgent = req.headers['user-agent'] || null;
		
		return this.authService.signinVerifyOtp(dto, {
			ipAddress,
			userAgent,
			deviceName: null, // Could be extracted from user-agent or passed from client
			location: null,   // Could be determined from IP geolocation
		});
	}

	@Post('refresh')
	@UseGuards(RefreshTokenGuard)
	async refresh(@Body() dto: RefreshTokenDto, @Req() req: FastifyRequest) {
		const ipAddress = req.ip || req.socket?.remoteAddress || null;
		const userAgent = req.headers['user-agent'] || null;
		
		// Log refresh request for security monitoring
		// console.log('Token refresh request:', {
		// 	ipAddress,
		// 	userAgent: userAgent?.substring(0, 100), // Log first 100 chars
		// 	timestamp: new Date().toISOString()
		// });
		
		return this.authService.refresh(dto);
	}

	// Test endpoint - no auth required
	@Get('test')
	async test(@Req() req: FastifyRequest) {
		const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
		const userAgent = req.headers['user-agent'] || 'unknown';
		
		return { 
			message: 'Server is working', 
			timestamp: new Date().toISOString(),
			clientInfo: {
				ipAddress,
				userAgent: userAgent.substring(0, 100) // First 100 chars
			}
		};
	}

	// Example of a protected route using the access token guard
	@Get('me')
	@UseGuards(AccessTokenGuard)
	async getMe(@Req() req: FastifyRequest) {
		// req.user is set by the guard
		// @ts-ignore
		const userId = (req as any).user.sub;
		const ipAddress = req.ip || req.socket?.remoteAddress || null;
		const userAgent = req.headers['user-agent'] || null;
		
		// console.log('Profile access:', {
		// 	userId,
		// 	ipAddress,
		// 	userAgent: userAgent?.substring(0, 50),
		// 	timestamp: new Date().toISOString()
		// });
		
		return this.authService.getUserProfile(userId);
	}

	// Get user's active sessions and devices
	@Get('sessions')
	@UseGuards(AccessTokenGuard)
	async getSessions(@Req() req: FastifyRequest) {
		// @ts-ignore
		const userId = (req as any).user.sub;
		return this.authService.getUserSessions(userId);
	}

	// Revoke a specific session
	@Post('sessions/:sessionId/revoke')
	@UseGuards(AccessTokenGuard)
	async revokeSession(@Req() req: FastifyRequest, @Body('sessionId') sessionId: string) {
		// @ts-ignore
		const userId = (req as any).user.sub;
		return this.authService.revokeSession(userId, sessionId);
	}    @Post('2fa/generate')
    @UseGuards(AccessTokenGuard)
    async generate2FA(@Req() req: FastifyRequest) {
      // console.log('2FA Generate endpoint called');
      // @ts-ignore
     const userId = (req as any).user.sub;
     const ipAddress = req.ip || req.socket?.remoteAddress || null;
     const userAgent = req.headers['user-agent'] || null;
     
     // console.log('2FA Generate request:', { 
     //   userId, 
     //   ipAddress, 
     //   userAgent: userAgent?.substring(0, 50),
     //   timestamp: new Date().toISOString() 
     // });
     
     if (!userId) {
      throw new BadRequestException('User not found');
    }
    return this.authService.generate2FASecret(userId);
   }

  // Step 2: Verify code
  @Post('2fa/verify')
  @UseGuards(AccessTokenGuard)
  async verify2FA(@Req() req: FastifyRequest, @Body('token') token: string) {
    // console.log('2FA Verify endpoint called');
    // @ts-ignore
    const userId = (req as any).user.sub;
    const ipAddress = req.ip || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;
    
    // console.log('2FA Verify request:', { 
    //   userId, 
    //   ipAddress, 
    //   userAgent: userAgent?.substring(0, 50),
    //   timestamp: new Date().toISOString() 
    // });
    // console.log('TOTP token received:', token);
    
    if (!token) {
      throw new BadRequestException('Missing token');
    }

    const isValid = await this.authService.verify2FA(userId, token);
    // console.log('2FA verification result:', isValid);
    
    if (!isValid) {
      throw new BadRequestException('Invalid 2FA token');
    }

    // console.log('2FA verification successful - otpEnabled should now be true');
    return { success: true, message: 'Two-factor authentication verified' };
  }
}
