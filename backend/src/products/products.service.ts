import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductCategory } from './entities/product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private repo: Repository<Product>,
    ) { }

    async create(dto: CreateProductDto): Promise<Product> {
        const product = this.repo.create(dto);
        return this.repo.save(product);
    }

    async findAll(category?: ProductCategory, activeOnly = true): Promise<Product[]> {
        const where: any = {};
        if (category) where.category = category;
        if (activeOnly) where.isActive = true;
        return this.repo.find({ where, order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.repo.findOne({ where: { id } });
        if (!product) throw new NotFoundException('Producto no encontrado');
        return product;
    }

    async update(id: string, dto: UpdateProductDto): Promise<Product> {
        await this.findOne(id);
        await this.repo.update(id, dto);
        return this.findOne(id);
    }

    async updateStock(id: string, quantity: number): Promise<Product> {
        const product = await this.findOne(id);
        product.stock += quantity;
        return this.repo.save(product);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.repo.softDelete(id);
    }

    async count(): Promise<number> {
        return this.repo.count({ where: { isActive: true } });
    }
}
