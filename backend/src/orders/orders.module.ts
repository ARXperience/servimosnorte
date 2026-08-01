import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import { CustomersModule } from '../customers/customers.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatbotModule } from '../chatbot/chatbot.module';
import { Payment } from '../payments/entities/payment.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Order, OrderItem, Payment]), 
        ProductsModule, 
        CustomersModule,
        NotificationsModule,
        ChatbotModule
    ],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule { }
