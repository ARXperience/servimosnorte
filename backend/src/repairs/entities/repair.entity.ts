import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum RepairStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    DELIVERED = 'DELIVERED',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
}

@Entity('repairs')
export class Repair {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    publicToken: string;

    @ManyToOne(() => Customer, (customer) => customer.repairs, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @Column()
    customerId: string;

    @Column()
    applianceType: string;

    @Column()
    brand: string;

    @Column({ nullable: true })
    model: string;

    @Column('text')
    problemDescription: string;

    @Column('text', { nullable: true })
    diagnostic: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    cost: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    deliveryCost: number;

    @Column({ nullable: true })
    estimatedTime: string;

    @Column({ nullable: true })
    appointmentDate: string;

    @Column({ type: 'varchar', default: RepairStatus.PENDING })
    status: RepairStatus;

    @Column({ type: 'varchar', default: PaymentStatus.UNPAID })
    paymentStatus: PaymentStatus;

    @Column('simple-array', { nullable: true })
    images: string[];

    @Column('text', { nullable: true })
    technicianNotes: string;

    @OneToMany(() => Payment, (payment) => payment.repair)
    payments: Payment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
