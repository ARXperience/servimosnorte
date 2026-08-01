"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async register(email, password, name, role = user_entity_1.UserRole.TECHNICIAN) {
        const exists = await this.userRepo.findOne({ where: { email } });
        if (exists)
            throw new common_1.ConflictException('El correo ya está registrado');
        const passwordHash = await bcrypt.hash(password, 10);
        const user = this.userRepo.create({ email, passwordHash, name, role });
        await this.userRepo.save(user);
        const { passwordHash: _, ...result } = user;
        return result;
    }
    async login(email, password) {
        const user = await this.userRepo.findOne({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    }
    async findById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async seedAdmin() {
        const exists = await this.userRepo.findOne({ where: { role: user_entity_1.UserRole.ADMIN } });
        if (!exists) {
            await this.register('admin@servimosnorte.com', 'Admin123!', 'Administrador', user_entity_1.UserRole.ADMIN);
            console.log('✅ Admin user seeded: admin@servimosnorte.com / Admin123!');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map