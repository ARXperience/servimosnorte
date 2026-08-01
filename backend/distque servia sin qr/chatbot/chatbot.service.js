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
var ChatbotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bot_config_entity_1 = require("./entities/bot-config.entity");
const chatbot_ai_service_1 = require("./chatbot-ai.service");
const fs = require("fs");
const path = require("path");
let WAClient;
let LocalAuth;
let MessageMedia;
let ChatbotService = ChatbotService_1 = class ChatbotService {
    constructor(configRepo, aiService) {
        this.configRepo = configRepo;
        this.aiService = aiService;
        this.logger = new common_1.Logger(ChatbotService_1.name);
        this.client = null;
        this.qrCode = null;
        this.isReady = false;
        this.isInitializing = false;
    }
    async onModuleInit() {
        try {
            const ww = await Promise.resolve().then(() => require('whatsapp-web.js'));
            WAClient = ww.Client;
            LocalAuth = ww.LocalAuth;
            MessageMedia = ww.MessageMedia;
            this.logger.log('whatsapp-web.js loaded successfully');
        }
        catch (e) {
            this.logger.warn('whatsapp-web.js not available, bot features disabled');
        }
    }
    async initialize() {
        if (!WAClient) {
            this.logger.warn('WAClient not available');
            return;
        }
        if (this.client) {
            this.logger.log('Destroying previous client before reinitializing...');
            try {
                await this.client.destroy();
            }
            catch (e) { }
            this.client = null;
        }
        this.isInitializing = true;
        this.isReady = false;
        this.qrCode = null;
        try {
            const authPath = path.join(process.cwd(), '.wwebjs_auth');
            if (fs.existsSync(authPath)) {
                this.logger.log('Removing old auth session to force fresh QR...');
                fs.rmSync(authPath, { recursive: true, force: true });
            }
            this.client = new WAClient({
                authStrategy: new LocalAuth({ clientId: 'servimos-norte' }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-gpu',
                        '--disable-extensions',
                        '--single-process',
                    ],
                },
            });
            this.client.on('qr', (qr) => {
                this.qrCode = qr;
                this.logger.log('📱 QR Code generated - scan with WhatsApp');
            });
            this.client.on('ready', () => {
                this.isReady = true;
                this.isInitializing = false;
                this.qrCode = null;
                this.logger.log('✅ WhatsApp Bot connected and ready!');
            });
            this.client.on('authenticated', () => {
                this.logger.log('🔐 WhatsApp authenticated successfully');
            });
            this.client.on('auth_failure', (msg) => {
                this.logger.error(`❌ Auth failure: ${msg}`);
                this.isInitializing = false;
                this.isReady = false;
                this.qrCode = null;
            });
            this.client.on('disconnected', (reason) => {
                this.logger.warn(`⚠️ Disconnected: ${reason}`);
                this.isReady = false;
                this.isInitializing = false;
                this.qrCode = null;
                this.client = null;
            });
            this.client.on('message', async (msg) => {
                await this.handleIncomingMessage(msg);
            });
            this.logger.log('🚀 Initializing WhatsApp client... waiting for QR...');
            this.client.initialize().catch((error) => {
                this.logger.error(`Error during WhatsApp initialization: ${error.message}`);
                this.isInitializing = false;
                this.isReady = false;
                this.client = null;
            });
        }
        catch (error) {
            this.logger.error(`Error setting up WhatsApp client: ${error.message}`);
            this.isInitializing = false;
            this.client = null;
        }
    }
    async handleIncomingMessage(msg) {
        try {
            if (msg.from.includes('@g.us') || msg.from === 'status@broadcast')
                return;
            const config = await this.aiService.getOrCreateConfig();
            if (!config.isActive)
                return;
            const phone = msg.from;
            const contact = await msg.getContact();
            const senderName = contact.pushname || contact.name || 'Cliente';
            let textContent = msg.body || '';
            if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
                this.logger.log(`🎤 Audio from ${senderName} (${phone})`);
                try {
                    const media = await msg.downloadMedia();
                    if (media) {
                        const audioBuffer = Buffer.from(media.data, 'base64');
                        const transcription = await this.aiService.transcribeAudio(audioBuffer, media.mimetype);
                        textContent = `[Audio transcrito]: ${transcription}`;
                        this.logger.log(`🎤 Transcription: ${transcription.substring(0, 80)}...`);
                    }
                    else {
                        textContent = '[El cliente envió un audio que no pudo ser procesado]';
                    }
                }
                catch (audioErr) {
                    this.logger.error(`Error processing audio: ${audioErr.message}`);
                    textContent = '[El cliente envió un audio que no pudo ser procesado]';
                }
            }
            if (!textContent || textContent.trim() === '')
                return;
            this.logger.log(`📩 Message from ${senderName} (${phone}): ${textContent.substring(0, 50)}...`);
            const response = await this.aiService.processMessage(phone, textContent, senderName);
            await msg.reply(response);
            this.logger.log(`📤 Replied to ${senderName}`);
        }
        catch (error) {
            this.logger.error(`Error handling message: ${error.message}`);
            try {
                await msg.reply('¡Disculpa! Tuve un problema. Por favor intenta de nuevo o llámanos. 📞');
            }
            catch (e) { }
        }
    }
    getQRCode() {
        return this.qrCode;
    }
    getStatus() {
        return {
            connected: this.isReady,
            initializing: this.isInitializing,
            hasQR: !!this.qrCode,
        };
    }
    async disconnect() {
        if (this.client) {
            try {
                await this.client.destroy();
            }
            catch (e) { }
            this.client = null;
            this.isReady = false;
            this.isInitializing = false;
            this.qrCode = null;
            this.logger.log('WhatsApp disconnected');
        }
    }
};
exports.ChatbotService = ChatbotService;
exports.ChatbotService = ChatbotService = ChatbotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(bot_config_entity_1.BotConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        chatbot_ai_service_1.ChatbotAiService])
], ChatbotService);
//# sourceMappingURL=chatbot.service.js.map