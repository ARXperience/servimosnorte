import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: string;

    @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column()
    productId: string;

    @Column({ default: 1 })
    quantity: number;

    @Column('decimal', { precision: 12, scale: 2 })
    unitPrice: number;
}
