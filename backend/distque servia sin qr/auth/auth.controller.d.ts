import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import("./entities/user.entity").UserRole;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("./entities/user.entity").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    profile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        role: import("./entities/user.entity").UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    seed(): Promise<{
        message: string;
    }>;
}
