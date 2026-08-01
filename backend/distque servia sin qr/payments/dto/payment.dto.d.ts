import { PaymentMethod, PaymentStatusEnum } from '../entities/payment.entity';
export declare class CreatePaymentDto {
    repairId?: string;
    orderId?: string;
    amount: number;
    method: PaymentMethod;
    description?: string;
    status?: PaymentStatusEnum;
}
