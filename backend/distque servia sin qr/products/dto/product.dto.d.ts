import { ProductCategory } from '../entities/product.entity';
export declare class CreateProductDto {
    name: string;
    description: string;
    price: number;
    stock: number;
    category: ProductCategory;
    warrantyInfo?: string;
    images?: string[];
    brand?: string;
    applianceType?: string;
}
export declare class UpdateProductDto {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: ProductCategory;
    warrantyInfo?: string;
    images?: string[];
    isActive?: boolean;
    brand?: string;
    applianceType?: string;
}
