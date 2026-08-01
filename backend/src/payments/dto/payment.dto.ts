import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatusEnum } from '../entities/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    repairId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    orderId?: string;

    @ApiProperty({ example: 250000 })
    @IsNumber()
    amount: number;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
    @IsEnum(PaymentMethod)
    method: PaymentMethod;

    @ApiProperty({ required: false, example: 'Pago por reparación de lavadora' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false, enum: PaymentStatusEnum })
    @IsOptional()
    @IsEnum(PaymentStatusEnum)
    status?: PaymentStatusEnum;
}
