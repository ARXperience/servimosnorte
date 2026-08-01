import { RepairStatus } from '../entities/repair.entity';
export declare class CreateRepairDto {
    customerId: string;
    applianceType: string;
    brand: string;
    model?: string;
    problemDescription: string;
    diagnostic?: string;
    cost?: number;
    estimatedTime?: string;
    appointmentDate?: string;
    technicianNotes?: string;
}
export declare class UpdateRepairDto {
    applianceType?: string;
    brand?: string;
    model?: string;
    problemDescription?: string;
    diagnostic?: string;
    cost?: number;
    estimatedTime?: string;
    appointmentDate?: string;
    status?: RepairStatus;
    technicianNotes?: string;
}
