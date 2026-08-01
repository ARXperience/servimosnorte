import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { BotConfig } from './entities/bot-config.entity';
import { CustomersService } from '../customers/customers.service';
import { RepairsService } from '../repairs/repairs.service';
import { ProductsService } from '../products/products.service';
export declare class ChatbotAiService {
    private convRepo;
    private configRepo;
    private customersService;
    private repairsService;
    private productsService;
    private readonly logger;
    private genAI;
    constructor(convRepo: Repository<Conversation>, configRepo: Repository<BotConfig>, customersService: CustomersService, repairsService: RepairsService, productsService: ProductsService);
    getOrCreateConfig(): Promise<BotConfig>;
    private getDefaultSystemPrompt;
    getConversation(phone: string): Promise<Conversation>;
    transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string>;
    processMessage(phone: string, userMessage: string, senderName?: string): Promise<string>;
    private cleanResponse;
    private handleAutoScheduling;
    private buildContextData;
    private buildFaqsContext;
    clearConversation(phone: string): Promise<void>;
    getAllConversations(): Promise<Conversation[]>;
}
