import { UserRole } from '../entities/user.entity';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: UserRole;
}
