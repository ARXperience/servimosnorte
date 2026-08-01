import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
    @ApiProperty()
    @IsString()
    productId: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @Min(1)
    quantity: number;
}

export class CreateOrderDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty({ required: false, example: 'Juan Pérez' })
    @IsOptional()
    @IsString()
    guestName?: string;

    @ApiProperty({ required: false, example: '3001234567' })
    @IsOptional()
    @IsString()
    guestPhone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    guestEmail?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    shippingAddress?: string;

    @ApiProperty({ required: false, example: 5000 })
    @IsOptional()
    @IsNumber()
    deliveryCost?: number;

    @ApiProperty({ type: [OrderItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}
