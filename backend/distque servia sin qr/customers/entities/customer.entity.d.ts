import { Repair } from '../../repairs/entities/repair.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Customer {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    repairs: Repair[];
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
}
