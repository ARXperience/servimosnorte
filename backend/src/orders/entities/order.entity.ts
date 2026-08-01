import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum OrderStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, nullable: true })
    radicado: string;

    @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true, nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column({ nullable: true })
    customerId: string;

    @Column({ nullable: true })
    guestName: string;

    @Column({ nullable: true })
    guestPhone: string;

    @Column({ nullable: true })
    guestEmail: string;

    @Column({ nullable: true })
    shippingAddress: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    total: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    deliveryCost: number;

    @Column({ type: 'varchar', default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ nullable: true })
    paymentMethod: string;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
    items: OrderItem[];

    @OneToMany(() => Payment, (payment) => payment.order)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
