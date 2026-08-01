import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CreateOrderDto } from './dto/order.dto';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ChatbotService } from '../chatbot/chatbot.service';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(OrderItem) private itemRepo: Repository<OrderItem>,
        private productsService: ProductsService,
        private customersService: CustomersService,
        private emailService: EmailService,
        private notificationsService: NotificationsService,
        private chatbotService: ChatbotService,
        private configService: ConfigService,
    ) { }

    async create(dto: CreateOrderDto): Promise<Order> {
        let total = 0;
        const items: Partial<OrderItem>[] = [];

        for (const item of dto.items) {
            const product = await this.productsService.findOne(item.productId);
            if (product.stock < item.quantity) {
                throw new BadRequestException(`Stock insuficiente para ${product.name}`);
            }
            total += product.price * item.quantity;
            items.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            });
        }

        let customerId = dto.customerId;

        if (!customerId && dto.guestPhone && dto.guestName) {
            let customer = await this.customersService.findByPhone(dto.guestPhone);
            if (!customer) {
                customer = await this.customersService.create({
                    fullName: dto.guestName,
                    phone: dto.guestPhone,
                    email: dto.guestEmail || '',
                    address: dto.shippingAddress || '',
                });
            }
            customerId = customer.id;
        }

        const deliveryCost = Number(dto.deliveryCost) || 0;

        // Generate radicado / order number
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const radicado = `ORD-${dateStr}-${randomId}`;

        const order = this.orderRepo.create({
            customerId,
            guestName: dto.guestName,
            guestPhone: dto.guestPhone,
            guestEmail: dto.guestEmail,
            shippingAddress: dto.shippingAddress,
            deliveryCost,
            total: total + deliveryCost,
            radicado,
            items: items as OrderItem[],
        });

        const savedOrder = await this.orderRepo.save(order);

        // Note: Stock is now decremented only when the order is PAID or confirmed
        
        // --- Notifications ---
        const customerPhone = dto.guestPhone || savedOrder.customer?.phone;
        const customerName = dto.guestName || savedOrder.customer?.fullName;
        const customerEmail = dto.guestEmail || savedOrder.customer?.email;
        const adminPhone = this.configService.get<string>('ADMIN_WHATSAPP_NUMBER') || '3028618806';

        // 1. WhatsApp to buyer
        if (customerPhone) {
            const msgToBuyer = `Hola ${customerName}, hemos recibido tu pedido (Orden: ${radicado}) por un total de $${savedOrder.total}. Por favor, realiza el pago en línea para confirmarlo. ¡Gracias por elegir Servimos Norte!`;
            this.chatbotService.sendSystemNotification(customerPhone, msgToBuyer);
        }

        // 2. WhatsApp to admin
        const msgToAdmin = `🚨 *Nuevo Pedido* 🚨\nOrden: ${radicado}\nCliente: ${customerName}\nTeléfono: ${customerPhone}\nTotal: $${savedOrder.total}\nEstado: PENDIENTE DE PAGO.`;
        this.chatbotService.sendSystemNotification(adminPhone, msgToAdmin);

        // 3. Email to buyer
        if (customerEmail) {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #f8f9fa; padding: 25px 20px; text-align: center; border-bottom: 4px solid #DE073F;">
                        <img src="https://servimosnorte.com/logo.png" alt="Servimos Norte" style="max-width: 250px; height: auto; margin-bottom: 10px;" />
                        <h2 style="color: #DE073F; margin: 0; font-size: 22px; font-weight: bold;">¡Orden Confirmada!</h2>
                    </div>
                    <div style="padding: 30px 20px;">
                        <p style="font-size: 16px; margin-top: 0;">Hola <strong>${customerName}</strong>,</p>
                        <p style="font-size: 15px; line-height: 1.5;">Hemos recibido exitosamente tu pedido <b style="color: #DE073F; font-size: 16px;">${radicado}</b> por un valor total de <strong>$${savedOrder.total}</strong>.</p>
                        <p style="font-size: 15px; line-height: 1.5;">Si pagaste en línea, tu pago está siendo procesado o ya fue confirmado. Si elegiste pagar al recoger, te esperamos en nuestra tienda con tu número de orden.</p>
                        
                        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #DE073F; border-radius: 4px; margin: 25px 0;">
                            <strong style="color: #DE073F; display: block; margin-bottom: 5px;">📍 Detalles de entrega o retiro:</strong>
                            <span style="font-size: 14px; color: #555;">${dto.shippingAddress}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">Si tienes dudas sobre tu pedido, puedes responder directamente a este correo electrónico.</p>
                        <p style="font-size: 16px; font-weight: bold; color: #333;">¡Gracias por preferir a Servimos Norte!</p>
                    </div>
                    <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} Servimos Norte. Todos los derechos reservados.</p>
                    </div>
                </div>
            `;
            this.emailService.sendNotificationEmail(customerEmail, `Confirmación de Orden ${radicado} - Servimos Norte`, emailHtml);
        }

        // 4. Email to admin
        const adminEmail = this.configService.get<string>('SMTP_USER');
        if (adminEmail) {
            const itemsHtml = savedOrder.items.map(item => `<li>${item.quantity}x (ID Producto: ${item.productId}) - $${item.unitPrice} c/u</li>`).join('');
            const adminEmailHtml = `
                <h2>Nuevo Pedido Recibido: ${radicado}</h2>
                <p><strong>Cliente:</strong> ${customerName}</p>
                <p><strong>Teléfono:</strong> ${customerPhone}</p>
                <p><strong>Email:</strong> ${customerEmail || 'No proporcionado'}</p>
                <p><strong>Dirección / Detalles:</strong> ${dto.shippingAddress}</p>
                <p><strong>Total:</strong> $${savedOrder.total}</p>
                <h3>Productos:</h3>
                <ul>
                    ${itemsHtml}
                </ul>
            `;
            this.emailService.sendNotificationEmail(adminEmail, `🚨 NUEVO PEDIDO: ${radicado}`, adminEmailHtml);
        }

        // 5. WebSocket & DB Notification
        this.notificationsService.createAndBroadcast(`Nuevo pedido creado: ${radicado} por ${customerName}`, 'ORDER_CREATED');

        return this.findOne(savedOrder.id);
    }

    async findAll(): Promise<Order[]> {
        return this.orderRepo.find({
            relations: ['customer', 'items', 'items.product', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
        if (!order) throw new NotFoundException('Orden no encontrada');
        return order;
    }

    async updateStatus(id: string, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id);
        const oldStatus = order.status;
        await this.orderRepo.update(id, { status });

        // Decrement stock if transitioning from PENDING to a confirmed status
        if (oldStatus === OrderStatus.PENDING && (status === OrderStatus.PAID || status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED)) {
            for (const item of order.items) {
                await this.productsService.updateStock(item.productId, -item.quantity);
            }
        }

        // Increment stock back if a confirmed order is cancelled
        if ((oldStatus === OrderStatus.PAID || oldStatus === OrderStatus.SHIPPED || oldStatus === OrderStatus.DELIVERED) && status === OrderStatus.CANCELLED) {
            for (const item of order.items) {
                await this.productsService.updateStock(item.productId, item.quantity);
            }
        }

        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.orderRepo.softDelete(id);
    }
}
