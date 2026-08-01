import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer) private repo: Repository<Customer>,
    ) { }

    async create(dto: CreateCustomerDto): Promise<Customer> {
        const customer = this.repo.create(dto);
        return this.repo.save(customer);
    }

    async handleContact(dto: CreateCustomerDto): Promise<Customer> {
        let customer = await this.repo.findOne({ where: { phone: dto.phone } });
        if (customer) {
            customer.fullName = dto.fullName;
            if (dto.notes) {
                customer.notes = customer.notes ? `${customer.notes} | Web: ${dto.notes}` : `Web: ${dto.notes}`;
            }
            return this.repo.save(customer);
        }
        
        const newCustomer = this.repo.create({
            ...dto,
            notes: dto.notes ? `Web: ${dto.notes}` : 'Contacto desde sitio web',
        });
        return this.repo.save(newCustomer);
    }

    async findAll(search?: string): Promise<Customer[]> {
        if (search) {
            return this.repo.find({
                where: [
                    { phone: Like(`%${search}%`) },
                    { whatsappId: Like(`%${search}%`) },
                    { fullName: Like(`%${search}%`) },
                ],
                order: { createdAt: 'DESC' },
            });
        }
        return this.repo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Customer> {
        const customer = await this.repo.findOne({
            where: { id },
            relations: ['repairs', 'orders'],
        });
        if (!customer) throw new NotFoundException('Cliente no encontrado');
        return customer;
    }

    async findByPhone(phone: string): Promise<Customer | null> {
        return this.repo.findOne({ where: { phone } });
    }

    async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.repo.softDelete(id);
    }

    async count(): Promise<number> {
        return this.repo.count();
    }
}
