import { Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { ChatbotAiService } from './chatbot-ai.service';
import { Repository } from 'typeorm';
import { BotConfig } from './entities/bot-config.entity';
export declare class ChatbotController {
    private chatbotService;
    private aiService;
    private configRepo;
    constructor(chatbotService: ChatbotService, aiService: ChatbotAiService, configRepo: Repository<BotConfig>);
    connect(): Promise<{
        message: string;
    }>;
    getQR(res: Response): Promise<Response<any, Record<string, any>>>;
    getStatus(): {
        connected: boolean;
        initializing: boolean;
        hasQR: boolean;
    };
    disconnect(): Promise<{
        message: string;
    }>;
    getConfig(): Promise<BotConfig>;
    updateConfig(body: {
        systemPrompt?: string;
        customInstructions?: string;
        faqs?: string;
        businessHours?: string;
        businessPhone?: string;
        isActive?: boolean;
    }): Promise<BotConfig>;
    getConversations(): Promise<import("./entities/conversation.entity").Conversation[]>;
    testMessage(body: {
        message: string;
        phone?: string;
    }): Promise<{
        response: string;
    }>;
}
