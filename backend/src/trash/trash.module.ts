import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrashController } from './trash.controller';
import { TrashService } from './trash.service';
import { Customer } from '../customers/entities/customer.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Product } from '../products/entities/product.entity';
import { Order } from '../orders/entities/order.entity';
import { User } from '../auth/entities/user.entity';
import { Conversation } from '../chatbot/entities/conversation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Customer, Repair, Product, Order, User, Conversation])],
    controllers: [TrashController],
    providers: [TrashService],
})
export class TrashModule {}
