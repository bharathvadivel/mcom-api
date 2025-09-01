import { IsEmail, IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class SetPasswordDto {
  @IsEmail()
  email!: string;

  @IsString()
  otp!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, special character, and be 8-64 chars.'
  })
  password!: string;

  @IsString()
  confirmPassword!: string;
}
