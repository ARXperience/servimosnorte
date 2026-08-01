import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare class Order {
    id: string;
    customer: Customer;
    customerId: string;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    shippingAddress: string;
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    items: OrderItem[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
}
