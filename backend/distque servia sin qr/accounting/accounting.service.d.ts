import { Repository } from 'typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Order } from '../orders/entities/order.entity';
export declare class AccountingService {
    private paymentRepo;
    private repairRepo;
    private orderRepo;
    constructor(paymentRepo: Repository<Payment>, repairRepo: Repository<Repair>, orderRepo: Repository<Order>);
    getDashboardStats(): Promise<{
        totalRepairs: number;
        totalOrders: number;
        monthlyRevenue: number;
        repairIncome: number;
        productSales: number;
        pendingTotal: number;
        pendingCount: number;
    }>;
    getRevenueReport(startDate: Date, endDate: Date): Promise<{
        id: string;
        fecha: Date;
        monto: number;
        metodo: import("../payments/entities/payment.entity").PaymentMethod;
        tipo: string;
        descripcion: string;
        transaccion: string;
    }[]>;
    exportCSV(startDate: Date, endDate: Date): Promise<string>;
}
