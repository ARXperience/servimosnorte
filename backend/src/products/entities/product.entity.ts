import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';

export enum ProductCategory {
    NEW = 'NEW',
    REFURBISHED = 'REFURBISHED',
    SPARE_PART = 'SPARE_PART',
    ACCESSORY = 'ACCESSORY',
}

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column('decimal', { precision: 12, scale: 2 })
    price: number;

    @Column({ default: 0 })
    stock: number;

    @Column({ type: 'varchar', default: ProductCategory.SPARE_PART })
    category: ProductCategory;

    @Column({ nullable: true })
    warrantyInfo: string;

    @Column('simple-json', { nullable: true })
    images: string[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    brand: string;

    @Column({ nullable: true })
    applianceType: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
