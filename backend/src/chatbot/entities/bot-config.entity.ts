import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('bot_config')
export class BotConfig {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text', default: '' })
    systemPrompt: string;

    @Column({ type: 'text', default: '' })
    customInstructions: string;

    @Column({ type: 'text', default: '[]' })
    faqs: string; // JSON: [{ question, answer }]

    @Column({ default: 'Lunes a Sábado 8:00 AM - 6:00 PM' })
    businessHours: string;

    @Column({ default: '312 584 6294' })
    businessPhone: string;

    @Column({ default: true })
    isActive: boolean;

    @UpdateDateColumn()
    updatedAt: Date;
}
