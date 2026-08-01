import { Customer } from '../../customers/entities/customer.entity';
import { Payment } from '../../payments/entities/payment.entity';
export declare enum RepairStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    DELIVERED = "DELIVERED"
}
export declare enum PaymentStatus {
    UNPAID = "UNPAID",
    PARTIAL = "PARTIAL",
    PAID = "PAID"
}
export declare class Repair {
    id: string;
    publicToken: string;
    customer: Customer;
    customerId: string;
    applianceType: string;
    brand: string;
    model: string;
    problemDescription: string;
    diagnostic: string;
    cost: number;
    estimatedTime: string;
    appointmentDate: string;
    status: RepairStatus;
    paymentStatus: PaymentStatus;
    images: string[];
    technicianNotes: string;
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
