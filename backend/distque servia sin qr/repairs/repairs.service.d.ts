import { Repository } from 'typeorm';
import { Repair, RepairStatus, PaymentStatus } from './entities/repair.entity';
import { CreateRepairDto, UpdateRepairDto } from './dto/repair.dto';
export declare class RepairsService {
    private repo;
    constructor(repo: Repository<Repair>);
    create(dto: CreateRepairDto): Promise<Repair>;
    findAll(status?: RepairStatus): Promise<Repair[]>;
    findOne(id: string): Promise<Repair>;
    findByToken(token: string): Promise<Repair>;
    update(id: string, dto: UpdateRepairDto): Promise<Repair>;
    updateStatus(id: string, status: RepairStatus): Promise<Repair>;
    acceptRepair(token: string): Promise<Repair>;
    rejectRepair(token: string): Promise<Repair>;
    updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Repair>;
    countByStatus(): Promise<Record<string, number>>;
    remove(id: string): Promise<void>;
}
