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
	async signin(@Body() dto: SigninDto) {
		return this.authService.signin(dto);
	}

	@Post('signin/verify-otp')
	async signinVerifyOtp(@Body() dto: VerifyOtpDto) {
		return this.authService.signinVerifyOtp(dto);
	}

			@Post('refresh')
			@UseGuards(RefreshTokenGuard)
			async refresh(@Body() dto: RefreshTokenDto) {
				return this.authService.refresh(dto);
			}

			// Example of a protected route using the access token guard
				@Get('me')
				@UseGuards(AccessTokenGuard)
				async getMe(@Req() req: FastifyRequest) {
					// req.user is set by the guard
					// @ts-ignore
					return { user: (req as any).user };
				}
}
