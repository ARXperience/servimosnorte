"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chatbot_service_1 = require("./chatbot.service");
const chatbot_ai_service_1 = require("./chatbot-ai.service");
const chatbot_controller_1 = require("./chatbot.controller");
const conversation_entity_1 = require("./entities/conversation.entity");
const bot_config_entity_1 = require("./entities/bot-config.entity");
const customers_module_1 = require("../customers/customers.module");
const repairs_module_1 = require("../repairs/repairs.module");
const products_module_1 = require("../products/products.module");
let ChatbotModule = class ChatbotModule {
};
exports.ChatbotModule = ChatbotModule;
exports.ChatbotModule = ChatbotModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([conversation_entity_1.Conversation, bot_config_entity_1.BotConfig]),
            customers_module_1.CustomersModule,
            repairs_module_1.RepairsModule,
            products_module_1.ProductsModule,
        ],
        controllers: [chatbot_controller_1.ChatbotController],
        providers: [chatbot_service_1.ChatbotService, chatbot_ai_service_1.ChatbotAiService],
        exports: [chatbot_service_1.ChatbotService, chatbot_ai_service_1.ChatbotAiService],
    })
], ChatbotModule);
//# sourceMappingURL=chatbot.module.js.map