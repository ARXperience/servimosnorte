import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repair } from './entities/repair.entity';
import { RepairsService } from './repairs.service';
import { RepairsController } from './repairs.controller';
import { CustomersModule } from '../customers/customers.module';

@Module({
    imports: [TypeOrmModule.forFeature([Repair]), CustomersModule],
    controllers: [RepairsController],
    providers: [RepairsService],
    exports: [RepairsService],
})
export class RepairsModule { }
