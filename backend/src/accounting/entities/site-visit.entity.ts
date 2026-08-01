import { Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('site_visits')
export class SiteVisit {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    createdAt: Date;
}
