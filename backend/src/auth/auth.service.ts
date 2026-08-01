import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async register(email: string, password: string, name: string, role: UserRole = UserRole.TECHNICIAN) {
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists) throw new ConflictException('El correo ya está registrado');

        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({ email, passwordHash, name, role });
        await this.userRepo.save(user);

        const { passwordHash: _, ...result } = user;
        return result;
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Credenciales inválidas');

        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }

    async findById(id: string) {
        return this.userRepo.findOne({ where: { id } });
    }

    async findAllUsers() {
        const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
        return users.map(({ passwordHash, ...result }) => result);
    }

    async updateUserPassword(id: string, password: string) {
        const user = await this.findById(id);
        if (!user) throw new UnauthorizedException('Usuario no encontrado');
        user.passwordHash = await bcrypt.hash(password, 10);
        await this.userRepo.save(user);
        const { passwordHash: _, ...result } = user;
        return result;
    }

    async deleteUser(id: string) {
        return this.userRepo.softDelete(id);
    }

    async seedAdmin() {
        const exists = await this.userRepo.findOne({ where: { role: UserRole.ADMIN } });
        if (!exists) {
            await this.register('admin@servimosnorte.com', 'Admin123!', 'Administrador', UserRole.ADMIN);
            console.log('✅ Admin user seeded: admin@servimosnorte.com / Admin123!');
        }
    }
}
