import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
export declare class CustomersService {
    private repo;
    constructor(repo: Repository<Customer>);
    create(dto: CreateCustomerDto): Promise<Customer>;
    findAll(search?: string): Promise<Customer[]>;
    findOne(id: string): Promise<Customer>;
    findByPhone(phone: string): Promise<Customer | null>;
    update(id: string, dto: UpdateCustomerDto): Promise<Customer>;
    remove(id: string): Promise<void>;
    count(): Promise<number>;
}
