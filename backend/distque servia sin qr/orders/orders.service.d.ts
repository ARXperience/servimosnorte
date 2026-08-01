import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';
import { CreateOrderDto } from './dto/order.dto';
export declare class OrdersService {
    private orderRepo;
    private itemRepo;
    private productsService;
    private customersService;
    constructor(orderRepo: Repository<Order>, itemRepo: Repository<OrderItem>, productsService: ProductsService, customersService: CustomersService);
    create(dto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    remove(id: string): Promise<void>;
}
