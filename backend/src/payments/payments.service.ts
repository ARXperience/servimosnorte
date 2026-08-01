import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentMethod, PaymentStatusEnum } from './entities/payment.entity';
import { RepairsService } from '../repairs/repairs.service';
import { OrdersService } from '../orders/orders.service';
import { PaymentStatus } from '../repairs/entities/repair.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatbotService } from '../chatbot/chatbot.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;
    private readonly logger = new Logger(PaymentsService.name);

    constructor(
        @InjectRepository(Payment) private repo: Repository<Payment>,
        private repairsService: RepairsService,
        private ordersService: OrdersService,
        private config: ConfigService,
        private emailService: EmailService,
        private notificationsService: NotificationsService,
        private chatbotService: ChatbotService,
    ) {
        const stripeKey = this.config.get('STRIPE_SECRET_KEY');
        if (stripeKey && stripeKey !== 'sk_test_your_stripe_key_here') {
            this.stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' as any });
        }
    }

    async createPayment(dto: CreatePaymentDto): Promise<Payment> {
        const payment = this.repo.create(dto);
        
        // Update related entity status if it defaults to completed
        if (!dto.status && (dto.method === PaymentMethod.CASH || dto.method === PaymentMethod.TRANSFER)) {
            payment.status = PaymentStatusEnum.COMPLETED;
        }

        const saved = await this.repo.save(payment);

        if (saved.status === PaymentStatusEnum.COMPLETED) {
            await this.updateRelatedStatus(saved);
        }

        return saved;
    }

    async createStripeCheckout(dto: CreatePaymentDto): Promise<{ url: string; paymentId: string }> {
        if (!this.stripe) {
            throw new Error('Stripe no está configurado. Agregue STRIPE_SECRET_KEY en .env');
        }

        const payment = this.repo.create({ ...dto, method: PaymentMethod.STRIPE });
        const saved = await this.repo.save(payment);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'cop',
                    product_data: { name: dto.description || 'Pago Servimos Norte' },
                    unit_amount: Math.round(dto.amount * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${this.config.get('FRONTEND_URL')}/pago/exito?payment=${saved.id}`,
            cancel_url: `${this.config.get('FRONTEND_URL')}/pago/cancelado`,
            metadata: { paymentId: saved.id },
        });

        saved.transactionId = session.id;
        await this.repo.save(saved);

        return { url: session.url!, paymentId: saved.id };
    }

    async confirmStripePayment(sessionId: string): Promise<Payment> {
        const payment = await this.repo.findOne({ where: { transactionId: sessionId } });
        if (!payment) throw new NotFoundException('Pago no encontrado');

        payment.status = PaymentStatusEnum.COMPLETED;
        await this.repo.save(payment);
        await this.updateRelatedStatus(payment);

        return payment;
    }

    private async updateRelatedStatus(payment: Payment) {
        if (payment.repairId) {
            const repair = await this.repairsService.findOne(payment.repairId);
            const totalPaid = await this.getTotalPaidForRepair(payment.repairId);
            if (totalPaid >= repair.cost) {
                await this.repairsService.updatePaymentStatus(payment.repairId, PaymentStatus.PAID);
            } else if (totalPaid > 0) {
                await this.repairsService.updatePaymentStatus(payment.repairId, PaymentStatus.PARTIAL);
            }
        }
        if (payment.orderId) {
            const order = await this.ordersService.updateStatus(payment.orderId, OrderStatus.PAID);
            
            // Trigger notifications for paid order
            const customerPhone = order.guestPhone || order.customer?.phone;
            const customerName = order.guestName || order.customer?.fullName;
            const customerEmail = order.guestEmail || order.customer?.email;
            const radicado = (order as any).radicado || order.id;
            const adminPhone = this.config.get<string>('ADMIN_WHATSAPP_NUMBER') || '3028618806';

            // WebSocket
            this.notificationsService.createAndBroadcast(`El pedido ${radicado} de ${customerName} ha sido PAGADO.`, 'ORDER_PAID');

            // Admin WhatsApp
            this.chatbotService.sendSystemNotification(adminPhone, `✅ *Pago Confirmado*\nRadicado: ${radicado}\nCliente: ${customerName}\nValor: $${payment.amount}\nEl pedido ya está listo para despacho.`);

            // Buyer WhatsApp
            if (customerPhone) {
                this.chatbotService.sendSystemNotification(customerPhone, `Hola ${customerName}, hemos recibido el pago de tu pedido ${radicado} exitosamente. ¡Pronto procederemos con el envío!`);
            }

            // Buyer Email
            if (customerEmail) {
                const emailHtml = `
                    <h2>¡Pago Recibido!</h2>
                    <p>Hola ${customerName},</p>
                    <p>Hemos confirmado el pago de tu pedido <b>${radicado}</b> por valor de $${payment.amount}.</p>
                    <p>Pronto lo estaremos despachando.</p>
                    <br>
                    <p>Gracias por tu compra.</p>
                `;
                this.emailService.sendNotificationEmail(customerEmail, `Pago Confirmado - Pedido ${radicado}`, emailHtml);
            }
        }
    }

    async confirmCredibancoPayment(data: any): Promise<any> {
        this.logger.log('Recibida respuesta de Credibanco:', data);
        
        // El campo order_number en credibanco debe mapearse a nuestro orderId internamente, o al Payment ID.
        // Asumiendo que el payment fue creado y enviado en order_number o transactionId
        // o si recibimos el orderId directamente
        const orderId = data.order_number || data.orderId || data.referenceCode;
        
        if (!orderId) {
            this.logger.error('No se recibió orderId en la respuesta de Credibanco');
            return { status: 'error', message: 'Falta identificador de orden' };
        }

        // Validate state if Credibanco sends success flag (e.g. estado=1, state=00, etc)
        // This is a placeholder since the exact response format depends on Credibanco's config
        // Asumiendo éxito por ahora para la prueba o si el webhook solo envía éxitos:
        
        let payment = await this.repo.findOne({ where: { orderId } });
        
        if (!payment) {
            // Si el pago no existe en la BD aún, lo creamos
            const order = await this.ordersService.findOne(orderId).catch(() => null);
            if (!order) {
                this.logger.error(`Orden no encontrada: ${orderId}`);
                return { status: 'error', message: 'Orden no encontrada' };
            }

            payment = this.repo.create({
                orderId,
                amount: order.total,
                method: 'CREDIBANCO' as PaymentMethod,
                status: PaymentStatusEnum.COMPLETED,
                transactionId: data.transaction_id || data.codigo_autorizacion || 'N/A'
            });
            payment = await this.repo.save(payment);
        } else {
            payment.status = PaymentStatusEnum.COMPLETED;
            payment.transactionId = data.transaction_id || data.codigo_autorizacion || payment.transactionId;
            payment = await this.repo.save(payment);
        }

        await this.updateRelatedStatus(payment);
        return { status: 'success', paymentId: payment.id };
    }

    private async getTotalPaidForRepair(repairId: string): Promise<number> {
        const result = await this.repo
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.repairId = :repairId', { repairId })
            .andWhere('payment.status = :status', { status: PaymentStatusEnum.COMPLETED })
            .getRawOne();
        return parseFloat(result.total) || 0;
    }

    async findAll(): Promise<Payment[]> {
        return this.repo.find({
            relations: ['repair', 'order'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Payment> {
        const payment = await this.repo.findOne({
            where: { id },
            relations: ['repair', 'order'],
        });
        if (!payment) throw new NotFoundException('Pago no encontrado');
        return payment;
    }

    async getRevenueByPeriod(startDate: Date, endDate: Date) {
        const payments = await this.repo.find({
            where: {
                status: PaymentStatusEnum.COMPLETED,
                createdAt: Between(startDate, endDate),
            },
            relations: ['repair', 'order'],
        });

        let repairIncome = 0;
        let productSales = 0;
        payments.forEach((p) => {
            if (p.repairId) repairIncome += Number(p.amount);
            if (p.orderId) productSales += Number(p.amount);
        });

        return {
            totalRevenue: repairIncome + productSales,
            repairIncome,
            productSales,
            totalPayments: payments.length,
        };
    }

    async updateStatus(id: string, status: PaymentStatusEnum): Promise<Payment> {
        const payment = await this.findOne(id);
        payment.status = status;
        const saved = await this.repo.save(payment);
        if (status === PaymentStatusEnum.COMPLETED) {
            await this.updateRelatedStatus(saved);
        }
        return saved;
    }

    async getPendingPayments(): Promise<Payment[]> {
        return this.repo.find({
            where: { status: PaymentStatusEnum.PENDING },
            relations: ['repair', 'order'],
        });
    }
}
