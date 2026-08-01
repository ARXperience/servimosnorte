import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BotConfig } from './entities/bot-config.entity';
import { ChatbotAiService } from './chatbot-ai.service';
export declare class ChatbotService implements OnModuleInit {
    private configRepo;
    private aiService;
    private readonly logger;
    private client;
    private qrCode;
    private isReady;
    private isInitializing;
    constructor(configRepo: Repository<BotConfig>, aiService: ChatbotAiService);
    onModuleInit(): Promise<void>;
    initialize(): Promise<void>;
    private handleIncomingMessage;
    getQRCode(): string | null;
    getStatus(): {
        connected: boolean;
        initializing: boolean;
        hasQR: boolean;
    };
    disconnect(): Promise<void>;
}
