import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
    ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';

@Entity('visitor_sessions')
export class VisitorSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ nullable: true })
    ip: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    region: string;

    @Column({ nullable: true })
    city: string;

    @Column('text', { nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    browser: string;

    @Column({ nullable: true })
    os: string;

    @Column({ nullable: true })
    device: string;

    @Column('text', { nullable: true })
    referrer: string;

    @Column({ nullable: true })
    language: string;

    @Column({ nullable: true })
    screen: string;

    @Index()
    @CreateDateColumn()
    startedAt: Date;

    @Column({ nullable: true })
    lastSeenAt: Date;

    @OneToMany(() => PageView, (pv) => pv.session)
    pageViews: PageView[];
}

@Entity('page_views')
export class PageView {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => VisitorSession, (s) => s.pageViews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sessionId' })
    session: VisitorSession;

    @Index()
    @Column()
    sessionId: string;

    @Index()
    @Column()
    path: string;

    @CreateDateColumn()
    enteredAt: Date;

    @Column({ type: 'int', default: 0 })
    durationSeconds: number;
}
