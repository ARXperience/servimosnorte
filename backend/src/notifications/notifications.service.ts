import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(Notification) private repo: Repository<Notification>,
        private gateway: NotificationsGateway,
    ) { }

    async createAndBroadcast(message: string, type?: string): Promise<Notification> {
        const notif = this.repo.create({ message, type });
        const saved = await this.repo.save(notif);
        
        this.gateway.broadcastNotification(saved);
        this.logger.log(`Notification sent: ${message}`);
        
        return saved;
    }

    async findAll(): Promise<Notification[]> {
        return this.repo.find({ order: { createdAt: 'DESC' }, take: 50 });
    }

    async markAsRead(id: string): Promise<Notification | null> {
        const notif = await this.repo.findOne({ where: { id } });
        if (notif) {
            notif.isRead = true;
            return this.repo.save(notif);
        }
        return null;
    }
}
