import { IsString, IsOptional, IsNumber, IsEnum, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
    @ApiProperty({ example: 'Vaso Licuadora Oster' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'Motor de repuesto compatible con múltiples marcas' })
    @IsString()
    description: string;

    @ApiProperty({ example: 185000 })
    @IsNumber()
    price: number;

    @ApiProperty({ example: 15 })
    @IsNumber()
    stock: number;

    @ApiProperty({ enum: ProductCategory, example: ProductCategory.SPARE_PART })
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiProperty({ example: '6 meses de garantía', required: false })
    @IsOptional()
    @IsString()
    warrantyInfo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    images?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    applianceType?: string;
}

export class UpdateProductDto {
    @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsNumber() price?: number;
    @ApiProperty({ required: false }) @IsOptional() @IsNumber() stock?: number;
    @ApiProperty({ required: false }) @IsOptional() @IsEnum(ProductCategory) category?: ProductCategory;
    @ApiProperty({ required: false }) @IsOptional() @IsString() warrantyInfo?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsArray() images?: string[];
    @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
    @ApiProperty({ required: false }) @IsOptional() @IsString() brand?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() applianceType?: string;
}
