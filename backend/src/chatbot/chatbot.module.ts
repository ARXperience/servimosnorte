import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotService } from './chatbot.service';
import { ChatbotAiService } from './chatbot-ai.service';
import { ChatbotController } from './chatbot.controller';
import { Conversation } from './entities/conversation.entity';
import { BotConfig } from './entities/bot-config.entity';
import { CustomersModule } from '../customers/customers.module';
import { RepairsModule } from '../repairs/repairs.module';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Conversation, BotConfig]),
        CustomersModule,
        RepairsModule,
        ProductsModule,
    ],
    controllers: [ChatbotController],
    providers: [ChatbotService, ChatbotAiService],
    exports: [ChatbotService, ChatbotAiService],
})
export class ChatbotModule { }
