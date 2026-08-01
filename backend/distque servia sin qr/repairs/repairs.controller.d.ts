import { RepairsService } from './repairs.service';
import { CreateRepairDto, UpdateRepairDto } from './dto/repair.dto';
import { RepairStatus } from './entities/repair.entity';
export declare class RepairsController {
    private service;
    constructor(service: RepairsService);
    create(dto: CreateRepairDto): Promise<import("./entities/repair.entity").Repair>;
    findAll(status?: RepairStatus): Promise<import("./entities/repair.entity").Repair[]>;
    stats(): Promise<Record<string, number>>;
    findByToken(token: string): Promise<import("./entities/repair.entity").Repair>;
    accept(token: string): Promise<import("./entities/repair.entity").Repair>;
    reject(token: string): Promise<import("./entities/repair.entity").Repair>;
    findOne(id: string): Promise<import("./entities/repair.entity").Repair>;
    update(id: string, dto: UpdateRepairDto): Promise<import("./entities/repair.entity").Repair>;
    updateStatus(id: string, status: RepairStatus): Promise<import("./entities/repair.entity").Repair>;
    remove(id: string): Promise<void>;
}
