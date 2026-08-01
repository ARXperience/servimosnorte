import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payments/entities/payment.entity';
import { Repair } from '../repairs/entities/repair.entity';
import { Order } from '../orders/entities/order.entity';
import { SiteVisit } from './entities/site-visit.entity';
import { VisitorSession, PageView } from './entities/visitor-session.entity';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Payment, Repair, Order, SiteVisit, VisitorSession, PageView])],
    controllers: [AccountingController],
    providers: [AccountingService],
})
export class AccountingModule { }
