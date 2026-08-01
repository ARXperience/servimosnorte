import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrderStatus } from './entities/order.entity';

@ApiTags('Órdenes')
@Controller('orders')
export class OrdersController {
    constructor(private service: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Crear orden (checkout)' })
    create(@Body() dto: CreateOrderDto) {
        return this.service.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar órdenes' })
    findAll() {
        return this.service.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener orden por ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar estado de orden' })
    updateStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
        return this.service.updateStatus(id, status);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar orden' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
