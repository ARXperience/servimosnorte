import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Clientes')
@Controller('customers')
export class CustomersController {
    constructor(private service: CustomersService) { }

    @Post('public-contact')
    @ApiOperation({ summary: 'Registrar contacto público' })
    handleContact(@Body() dto: CreateCustomerDto) {
        return this.service.handleContact(dto);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear cliente' })
    create(@Body() dto: CreateCustomerDto) {
        return this.service.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar clientes' })
    @ApiQuery({ name: 'search', required: false })
    findAll(@Query('search') search?: string) {
        return this.service.findAll(search);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener cliente por ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar cliente' })
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar cliente' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
