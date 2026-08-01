import { Controller, Get, Post, Body, Param, Query, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentStatusEnum } from './entities/payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Pagos')
@Controller('payments')
export class PaymentsController {
    constructor(private service: PaymentsService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar pago (efectivo/transferencia)' })
    create(@Body() dto: CreatePaymentDto) {
        return this.service.createPayment(dto);
    }

    @Post('stripe/checkout')
    @ApiOperation({ summary: 'Crear sesión de pago Stripe' })
    stripeCheckout(@Body() dto: CreatePaymentDto) {
        return this.service.createStripeCheckout(dto);
    }

    @Post('stripe/confirm/:sessionId')
    @ApiOperation({ summary: 'Confirmar pago Stripe' })
    stripeConfirm(@Param('sessionId') sessionId: string) {
        return this.service.confirmStripePayment(sessionId);
    }

    @Post('credibanco/response')
    @ApiOperation({ summary: 'Confirmar pago Credibanco' })
    credibancoResponse(@Body() payload: any, @Query() query: any) {
        // Credibanco can send data in body or query depending on configuration
        const data = Object.keys(payload).length > 0 ? payload : query;
        return this.service.confirmCredibancoPayment(data);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos los pagos' })
    findAll() {
        return this.service.findAll();
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Pagos pendientes' })
    pending() {
        return this.service.getPendingPayments();
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Cambiar estado de pago' })
    updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatusEnum) {
        return this.service.updateStatus(id, status);
    }

    @Get('revenue')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Ingresos por período' })
    revenue(@Query('start') start: string, @Query('end') end: string) {
        const startDate = start ? new Date(start) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const endDate = end ? new Date(end) : new Date();
        return this.service.getRevenueByPeriod(startDate, endDate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener pago por ID' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }
}
