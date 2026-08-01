import { Response } from 'express';
import { AccountingService } from './accounting.service';
export declare class AccountingController {
    private service;
    constructor(service: AccountingService);
    dashboard(): Promise<{
        totalRepairs: number;
        totalOrders: number;
        monthlyRevenue: number;
        repairIncome: number;
        productSales: number;
        pendingTotal: number;
        pendingCount: number;
    }>;
    report(start: string, end: string): Promise<{
        id: string;
        fecha: Date;
        monto: number;
        metodo: import("../payments/entities/payment.entity").PaymentMethod;
        tipo: string;
        descripcion: string;
        transaccion: string;
    }[]>;
    exportCSV(start: string, end: string, res: Response): Promise<void>;
}
