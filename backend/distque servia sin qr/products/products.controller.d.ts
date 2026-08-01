import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductCategory } from './entities/product.entity';
export declare class ProductsController {
    private service;
    constructor(service: ProductsService);
    create(dto: CreateProductDto): Promise<import("./entities/product.entity").Product>;
    findAll(category?: ProductCategory): Promise<import("./entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("./entities/product.entity").Product>;
    update(id: string, dto: UpdateProductDto): Promise<import("./entities/product.entity").Product>;
    uploadImages(id: string, files: Express.Multer.File[]): Promise<{
        images: string[];
    }>;
    remove(id: string): Promise<void>;
}
