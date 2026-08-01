import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class LoginDto {
    @ApiProperty({ example: 'admin@servimosnorte.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Admin123!' })
    @IsString()
    @MinLength(6)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ example: 'tech@servimosnorte.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'Password123!' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Juan Técnico' })
    @IsString()
    name: string;

    @ApiProperty({ enum: UserRole, default: UserRole.TECHNICIAN })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
