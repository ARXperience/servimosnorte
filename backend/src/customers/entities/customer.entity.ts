import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Repair } from '../../repairs/entities/repair.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;

    @Column({ unique: true })
    phone: string;

    @Column({ nullable: true })
    whatsappId: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    notes: string;

    @OneToMany(() => Repair, (repair) => repair.customer)
    repairs: Repair[];

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
