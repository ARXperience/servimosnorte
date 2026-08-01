import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from './entities/user.entity';
export declare class AuthService {
    private userRepo;
    private jwtService;
    constructor(userRepo: Repository<User>, jwtService: JwtService);
    register(email: string, password: string, name: string, role?: UserRole): Promise<{
        id: string;
        email: string;
        name: string;
        role: UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(email: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
        };
    }>;
    findById(id: string): Promise<User | null>;
    seedAdmin(): Promise<void>;
}
