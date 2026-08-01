import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductCategory } from './entities/product.entity';
import { getUploadsPath } from '../uploads-path';

const imageStorage = diskStorage({
    destination: (req, file, cb) => {
        const productsDir = join(getUploadsPath(), 'products');
        mkdirSync(productsDir, { recursive: true });
        cb(null, productsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
    },
});

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
    constructor(private service: ProductsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear producto' })
    create(@Body() dto: CreateProductDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar productos (público)' })
    @ApiQuery({ name: 'category', required: false, enum: ProductCategory })
    findAll(@Query('category') category?: ProductCategory) {
        return this.service.findAll(category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener producto por ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar producto' })
    update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.service.update(id, dto);
    }

    @Post(':id/images')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('images', 5, { storage: imageStorage }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Subir imágenes de producto' })
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const product = await this.service.findOne(id);
        const existingImages = product.images || [];
        const newImages = files.map(f => `/uploads/products/${f.filename}`);
        const allImages = [...existingImages, ...newImages];
        await this.service.update(id, { images: allImages } as any);
        return { images: allImages };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar producto' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
