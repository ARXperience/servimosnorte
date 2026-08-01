import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Repair, RepairStatus, PaymentStatus } from './entities/repair.entity';
import { CreateRepairDto, UpdateRepairDto } from './dto/repair.dto';

import { CustomersService } from '../customers/customers.service';

@Injectable()
export class RepairsService {
    constructor(
        @InjectRepository(Repair) private repo: Repository<Repair>,
        private customersService: CustomersService,
    ) { }

    async createPublicRequest(dto: CreateRepairDto): Promise<Repair> {
        // Handle guest customer
        let customerId = dto.customerId;
        if (!customerId && dto.guestPhone && dto.guestName) {
            const customer = await this.customersService.handleContact({
                fullName: dto.guestName,
                phone: dto.guestPhone,
                email: dto.guestEmail || '',
                address: dto.shippingAddress || '',
                notes: 'Solicitud web pública',
            });
            customerId = customer.id;
        } else if (!customerId) {
            throw new Error('Debe proporcionar datos del cliente');
        }

        const repair = this.repo.create({
            ...dto,
            customerId,
            publicToken: uuidv4(),
            status: RepairStatus.PENDING,
        });
        return this.repo.save(repair);
    }

    async create(dto: CreateRepairDto): Promise<Repair> {
        const repair = this.repo.create({
            ...dto,
            publicToken: uuidv4(),
        });
        return this.repo.save(repair);
    }

    async findAll(status?: RepairStatus): Promise<Repair[]> {
        const where = status ? { status } : {};
        return this.repo.find({
            where,
            relations: ['customer', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Repair> {
        const repair = await this.repo.findOne({
            where: { id },
            relations: ['customer', 'payments'],
        });
        if (!repair) throw new NotFoundException('Reparación no encontrada');
        return repair;
    }

    async findByToken(token: string): Promise<Repair> {
        const repair = await this.repo.findOne({
            where: { publicToken: token },
            relations: ['customer', 'payments'],
        });
        if (!repair) throw new NotFoundException('Reporte no encontrado');
        return repair;
    }

    async update(id: string, dto: UpdateRepairDto): Promise<Repair> {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async updateStatus(id: string, status: RepairStatus): Promise<Repair> {
        await this.findOne(id);
        await this.repo.update(id, { status });
        return this.findOne(id);
    }

    async acceptRepair(token: string): Promise<Repair> {
        const repair = await this.findByToken(token);
        repair.status = RepairStatus.ACCEPTED;
        return this.repo.save(repair);
    }

    async rejectRepair(token: string): Promise<Repair> {
        const repair = await this.findByToken(token);
        repair.status = RepairStatus.REJECTED;
        return this.repo.save(repair);
    }

    async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Repair> {
        await this.repo.update(id, { paymentStatus });
        return this.findOne(id);
    }

    async countByStatus(): Promise<Record<string, number>> {
        const result = await this.repo
            .createQueryBuilder('repair')
            .select('repair.status', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('repair.status')
            .getRawMany();

        const counts: Record<string, number> = {};
        result.forEach((r) => { counts[r.status] = parseInt(r.count); });
        return counts;
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.repo.softDelete(id);
    }
}
