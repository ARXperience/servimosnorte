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
exports.RepairsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const uuid_1 = require("uuid");
const repair_entity_1 = require("./entities/repair.entity");
let RepairsService = class RepairsService {
    constructor(repo) {
        this.repo = repo;
    }
    async create(dto) {
        const repair = this.repo.create({
            ...dto,
            publicToken: (0, uuid_1.v4)(),
        });
        return this.repo.save(repair);
    }
    async findAll(status) {
        const where = status ? { status } : {};
        return this.repo.find({
            where,
            relations: ['customer', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const repair = await this.repo.findOne({
            where: { id },
            relations: ['customer', 'payments'],
        });
        if (!repair)
            throw new common_1.NotFoundException('Reparación no encontrada');
        return repair;
    }
    async findByToken(token) {
        const repair = await this.repo.findOne({
            where: { publicToken: token },
            relations: ['customer', 'payments'],
        });
        if (!repair)
            throw new common_1.NotFoundException('Reporte no encontrado');
        return repair;
    }
    async update(id, dto) {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        await this.repo.update(id, { status });
        return this.findOne(id);
    }
    async acceptRepair(token) {
        const repair = await this.findByToken(token);
        repair.status = repair_entity_1.RepairStatus.ACCEPTED;
        return this.repo.save(repair);
    }
    async rejectRepair(token) {
        const repair = await this.findByToken(token);
        repair.status = repair_entity_1.RepairStatus.REJECTED;
        return this.repo.save(repair);
    }
    async updatePaymentStatus(id, paymentStatus) {
        await this.repo.update(id, { paymentStatus });
        return this.findOne(id);
    }
    async countByStatus() {
        const result = await this.repo
            .createQueryBuilder('repair')
            .select('repair.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('repair.status')
            .getRawMany();
        const counts = {};
        result.forEach((r) => { counts[r.status] = parseInt(r.count); });
        return counts;
    }
    async remove(id) {
        await this.findOne(id);
        await this.repo.delete(id);
    }
};
exports.RepairsService = RepairsService;
exports.RepairsService = RepairsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(repair_entity_1.Repair)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RepairsService);
//# sourceMappingURL=repairs.service.js.map