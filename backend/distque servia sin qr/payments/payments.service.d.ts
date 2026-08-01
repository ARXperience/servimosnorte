import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatusEnum } from './entities/payment.entity';
import { RepairsService } from '../repairs/repairs.service';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/payment.dto';
export declare class PaymentsService {
    private repo;
    private repairsService;
    private ordersService;
    private config;
    private stripe;
    constructor(repo: Repository<Payment>, repairsService: RepairsService, ordersService: OrdersService, config: ConfigService);
    createPayment(dto: CreatePaymentDto): Promise<Payment>;
    createStripeCheckout(dto: CreatePaymentDto): Promise<{
        url: string;
        paymentId: string;
    }>;
    confirmStripePayment(sessionId: string): Promise<Payment>;
    private updateRelatedStatus;
    private getTotalPaidForRepair;
    findAll(): Promise<Payment[]>;
    findOne(id: string): Promise<Payment>;
    getRevenueByPeriod(startDate: Date, endDate: Date): Promise<{
        totalRevenue: number;
        repairIncome: number;
        productSales: number;
        totalPayments: number;
    }>;
    updateStatus(id: string, status: PaymentStatusEnum): Promise<Payment>;
    getPendingPayments(): Promise<Payment[]>;
}
