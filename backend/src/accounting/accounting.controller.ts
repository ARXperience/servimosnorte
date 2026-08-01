import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AccountingService } from './accounting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StartSessionDto, PageViewDto, HeartbeatDto } from './dto/visit.dto';

@ApiTags('Contabilidad')
@Controller('accounting')
export class AccountingController {
    constructor(private service: AccountingService) { }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
    getDashboardStats() {
        return this.service.getDashboardStats();
    }

    @Post('visit')
    @ApiOperation({ summary: 'Registrar visita al sitio web (contador simple, legado)' })
    recordVisit() {
        return this.service.recordVisit();
    }

    @Post('visit/session')
    @ApiOperation({ summary: 'Iniciar sesión de visitante (tracking detallado)' })
    startSession(@Body() dto: StartSessionDto, @Req() req: Request) {
        return this.service.startVisitorSession(dto, req);
    }

    @Post('visit/pageview')
    @ApiOperation({ summary: 'Registrar página vista dentro de una sesión' })
    recordPageView(@Body() dto: PageViewDto) {
        return this.service.recordPageView(dto);
    }

    @Post('visit/heartbeat')
    @ApiOperation({ summary: 'Actualizar actividad y tiempo en página de una sesión' })
    heartbeat(@Body() dto: HeartbeatDto) {
        return this.service.visitHeartbeat(dto);
    }

    @Get('visitors')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listado detallado de sesiones de visitantes con filtros' })
    getVisitors(
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('country') country: string,
        @Query('device') device: string,
        @Query('path') path: string,
        @Query('search') search: string,
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.service.getVisitorSessions({
            start: start ? new Date(start) : new Date(Date.now() - 29 * 24 * 3600 * 1000),
            end: end ? new Date(end) : new Date(),
            country: country || undefined,
            device: device || undefined,
            path: path || undefined,
            search: search || undefined,
            page: Math.max(1, parseInt(page, 10) || 1),
            limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
        });
    }

    @Get('visitors/stats')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Estadísticas agregadas de visitantes (por día o por mes)' })
    getVisitorStats(
        @Query('start') start: string,
        @Query('end') end: string,
        @Query('groupBy') groupBy: string,
        @Query('tzOffset') tzOffset: string,
    ) {
        return this.service.getVisitorStats(
            start ? new Date(start) : new Date(Date.now() - 29 * 24 * 3600 * 1000),
            end ? new Date(end) : new Date(),
            groupBy === 'month' ? 'month' : 'day',
            parseInt(tzOffset, 10) || 0,
        );
    }

    @Get('report')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Reporte de ingresos por período' })
    report(@Query('start') start: string, @Query('end') end: string) {
        const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = end ? new Date(end) : new Date();
        return this.service.getRevenueReport(startDate, endDate);
    }

    @Get('export/csv')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Exportar reporte en CSV' })
    async exportCSV(
        @Query('start') start: string,
        @Query('end') end: string,
        @Res() res: Response,
    ) {
        const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = end ? new Date(end) : new Date();
        const csv = await this.service.exportCSV(startDate, endDate);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_servimos_norte.csv');
        res.send(csv);
    }
}
