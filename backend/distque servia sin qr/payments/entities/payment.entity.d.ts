import { Repair } from '../../repairs/entities/repair.entity';
import { Order } from '../../orders/entities/order.entity';
export declare enum PaymentMethod {
    STRIPE = "STRIPE",
    BOLD = "BOLD",
    CASH = "CASH",
    TRANSFER = "TRANSFER"
}
export declare enum PaymentStatusEnum {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    id: string;
    repair: Repair;
    repairId: string;
    order: Order;
    orderId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatusEnum;
    transactionId: string;
    description: string;
    createdAt: Date;
}
