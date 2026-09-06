import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@cryptovision/shared-types';

export class RegisterDto {
  @ApiProperty({ example: 'trader@cryptovision.pro' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SuperSecurePassword123!', minLength: 8 })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({ example: 'USER', enum: ['USER', 'PREMIUM', 'ADMIN'], required: false })
  @IsOptional()
  @IsEnum(['USER', 'PREMIUM', 'ADMIN'])
  role?: UserRole;
}
