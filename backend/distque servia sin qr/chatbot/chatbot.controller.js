"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chatbot_service_1 = require("./chatbot.service");
const chatbot_ai_service_1 = require("./chatbot-ai.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bot_config_entity_1 = require("./entities/bot-config.entity");
const QRCode = require("qrcode");
let ChatbotController = class ChatbotController {
    constructor(chatbotService, aiService, configRepo) {
        this.chatbotService = chatbotService;
        this.aiService = aiService;
        this.configRepo = configRepo;
    }
    async connect() {
        await this.chatbotService.initialize();
        return { message: 'Conexión WhatsApp iniciada' };
    }
    async getQR(res) {
        const qr = this.chatbotService.getQRCode();
        if (!qr) {
            return res.json({ qr: null, message: 'No QR available' });
        }
        try {
            const qrDataUrl = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
            return res.json({ qr: qrDataUrl });
        }
        catch (e) {
            return res.json({ qr: null, message: 'Error generating QR' });
        }
    }
    getStatus() {
        return this.chatbotService.getStatus();
    }
    async disconnect() {
        await this.chatbotService.disconnect();
        return { message: 'Desconectado' };
    }
    async getConfig() {
        return this.aiService.getOrCreateConfig();
    }
    async updateConfig(body) {
        const config = await this.aiService.getOrCreateConfig();
        Object.assign(config, body);
        return this.configRepo.save(config);
    }
    async getConversations() {
        return this.aiService.getAllConversations();
    }
    async testMessage(body) {
        const phone = body.phone || 'test-admin';
        const response = await this.aiService.processMessage(phone, body.message, 'Admin Test');
        return { response };
    }
};
exports.ChatbotController = ChatbotController;
__decorate([
    (0, common_1.Post)('connect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Initialize WhatsApp connection' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "connect", null);
__decorate([
    (0, common_1.Get)('qr'),
    (0, swagger_1.ApiOperation)({ summary: 'Get QR code as image' }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getQR", null);
__decorate([
    (0, common_1.Get)('status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get WhatsApp connection status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChatbotController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Post)('disconnect'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Disconnect WhatsApp' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "disconnect", null);
__decorate([
    (0, common_1.Get)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get bot configuration' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update bot configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all conversations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Post)('test-message'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Test bot with a message (without WhatsApp)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatbotController.prototype, "testMessage", null);
exports.ChatbotController = ChatbotController = __decorate([
    (0, swagger_1.ApiTags)('Chatbot'),
    (0, common_1.Controller)('chatbot'),
    __param(2, (0, typeorm_1.InjectRepository)(bot_config_entity_1.BotConfig)),
    __metadata("design:paramtypes", [chatbot_service_1.ChatbotService,
        chatbot_ai_service_1.ChatbotAiService,
        typeorm_2.Repository])
], ChatbotController);
//# sourceMappingURL=chatbot.controller.js.map