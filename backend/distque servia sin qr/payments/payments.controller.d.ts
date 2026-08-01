import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentStatusEnum } from './entities/payment.entity';
export declare class PaymentsController {
    private service;
    constructor(service: PaymentsService);
    create(dto: CreatePaymentDto): Promise<import("./entities/payment.entity").Payment>;
    stripeCheckout(dto: CreatePaymentDto): Promise<{
        url: string;
        paymentId: string;
    }>;
    stripeConfirm(sessionId: string): Promise<import("./entities/payment.entity").Payment>;
    findAll(): Promise<import("./entities/payment.entity").Payment[]>;
    pending(): Promise<import("./entities/payment.entity").Payment[]>;
    updateStatus(id: string, status: PaymentStatusEnum): Promise<import("./entities/payment.entity").Payment>;
    revenue(start: string, end: string): Promise<{
        totalRevenue: number;
        repairIncome: number;
        productSales: number;
        totalPayments: number;
    }>;
    findOne(id: string): Promise<import("./entities/payment.entity").Payment>;
}
