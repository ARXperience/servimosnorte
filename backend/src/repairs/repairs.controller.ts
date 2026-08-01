import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RepairsService } from './repairs.service';
import { CreateRepairDto, UpdateRepairDto } from './dto/repair.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RepairStatus } from './entities/repair.entity';

@ApiTags('Reparaciones')
@Controller('repairs')
export class RepairsController {
    constructor(private service: RepairsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear reporte de reparación' })
    create(@Body() dto: CreateRepairDto) {
        return this.service.create(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar reparaciones' })
    @ApiQuery({ name: 'status', required: false, enum: RepairStatus })
    findAll(@Query('status') status?: RepairStatus) {
        return this.service.findAll(status);
    }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Estadísticas de reparaciones por estado' })
    stats() {
        return this.service.countByStatus();
    }

    @Get('public/:token')
    @ApiOperation({ summary: 'Ver reporte público por token' })
    findByToken(@Param('token') token: string) {
        return this.service.findByToken(token);
    }

    @Post('public/request')
    @ApiOperation({ summary: 'Solicitar reparación (público)' })
    requestPublicRepair(@Body() dto: CreateRepairDto) {
        return this.service.createPublicRequest(dto);
    }

    @Post('public/:token/accept')
    @ApiOperation({ summary: 'Aceptar reparación (público)' })
    accept(@Param('token') token: string) {
        return this.service.acceptRepair(token);
    }

    @Post('public/:token/reject')
    @ApiOperation({ summary: 'Rechazar reparación (público)' })
    reject(@Param('token') token: string) {
        return this.service.rejectRepair(token);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener reparación por ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar reparación' })
    update(@Param('id') id: string, @Body() dto: UpdateRepairDto) {
        return this.service.update(id, dto);
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar estado de reparación' })
    updateStatus(@Param('id') id: string, @Body('status') status: RepairStatus) {
        return this.service.updateStatus(id, status);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar reparación' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
