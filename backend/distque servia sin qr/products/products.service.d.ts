import { Repository } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
export declare class ProductsService {
    private repo;
    constructor(repo: Repository<Product>);
    create(dto: CreateProductDto): Promise<Product>;
    findAll(category?: ProductCategory, activeOnly?: boolean): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    updateStock(id: string, quantity: number): Promise<Product>;
    remove(id: string): Promise<void>;
    count(): Promise<number>;
}
