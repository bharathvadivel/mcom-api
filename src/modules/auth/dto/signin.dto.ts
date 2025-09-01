import { IsEmail } from 'class-validator';

export class SigninDto {
  @IsEmail()
  email!: string;
}
