import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { OrderStatus } from './entities/order.entity';
export declare class OrdersController {
    private service;
    constructor(service: OrdersService);
    create(dto: CreateOrderDto): Promise<import("./entities/order.entity").Order>;
    findAll(): Promise<import("./entities/order.entity").Order[]>;
    findOne(id: string): Promise<import("./entities/order.entity").Order>;
    updateStatus(id: string, status: OrderStatus): Promise<import("./entities/order.entity").Order>;
    remove(id: string): Promise<void>;
}
