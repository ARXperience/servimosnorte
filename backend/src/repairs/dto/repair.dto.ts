import { IsString, IsOptional, IsNumber, IsEnum, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RepairStatus } from '../entities/repair.entity';

export class CreateRepairDto {
    @ApiProperty({ example: 'uuid-del-cliente', required: false })
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    guestName?: string;

    @ApiProperty({ required: false })
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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    deliveryCost?: number;

    @ApiProperty({ example: 'Licuadora' })
    @IsString()
    applianceType: string;

    @ApiProperty({ example: 'Samsung' })
    @IsString()
    brand: string;

    @ApiProperty({ example: 'WF45R6100AW', required: false })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({ example: 'No enciende, hace ruido al intentar iniciar ciclo' })
    @IsString()
    problemDescription: string;

    @ApiProperty({ example: 'Motor dañado, requiere reemplazo', required: false })
    @IsOptional()
    @IsString()
    diagnostic?: string;

    @ApiProperty({ example: 250000, required: false })
    @IsOptional()
    @IsNumber()
    cost?: number;

    @ApiProperty({ example: '3-5 días hábiles', required: false })
    @IsOptional()
    @IsString()
    estimatedTime?: string;

    @ApiProperty({ example: 'Lunes 15 a las 3pm', required: false })
    @IsOptional()
    @IsString()
    appointmentDate?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    technicianNotes?: string;
}

export class UpdateRepairDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    applianceType?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    model?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    problemDescription?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    diagnostic?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    cost?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    estimatedTime?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    appointmentDate?: string;

    @ApiProperty({ required: false, enum: RepairStatus })
    @IsOptional()
    @IsEnum(RepairStatus)
    status?: RepairStatus;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    technicianNotes?: string;
}
