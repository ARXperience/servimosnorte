import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Repair } from '../../repairs/entities/repair.entity';
import { Order } from '../../orders/entities/order.entity';

export enum PaymentMethod {
    STRIPE = 'STRIPE',
    BOLD = 'BOLD',
    CASH = 'CASH',
    TRANSFER = 'TRANSFER',
    CREDIBANCO = 'CREDIBANCO',
}

export enum PaymentStatusEnum {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Repair, (repair) => repair.payments, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'repairId' })
    repair: Repair;

    @Column({ nullable: true })
    repairId: string;

    @ManyToOne(() => Order, (order) => order.payments, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column({ nullable: true })
    orderId: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'varchar' })
    method: PaymentMethod;

    @Column({ type: 'varchar', default: PaymentStatusEnum.PENDING })
    status: PaymentStatusEnum;

    @Column({ nullable: true })
    transactionId: string;

    @Column('text', { nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;
}
