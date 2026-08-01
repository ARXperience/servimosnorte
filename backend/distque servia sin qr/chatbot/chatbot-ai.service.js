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
var ChatbotAiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatbotAiService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const generative_ai_1 = require("@google/generative-ai");
const conversation_entity_1 = require("./entities/conversation.entity");
const bot_config_entity_1 = require("./entities/bot-config.entity");
const customers_service_1 = require("../customers/customers.service");
const repairs_service_1 = require("../repairs/repairs.service");
const products_service_1 = require("../products/products.service");
let ChatbotAiService = ChatbotAiService_1 = class ChatbotAiService {
    constructor(convRepo, configRepo, customersService, repairsService, productsService) {
        this.convRepo = convRepo;
        this.configRepo = configRepo;
        this.customersService = customersService;
        this.repairsService = repairsService;
        this.productsService = productsService;
        this.logger = new common_1.Logger(ChatbotAiService_1.name);
        const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBNEWC8AUqb6KxXvMaGkvpv42OA4gxI0cs';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
    }
    async getOrCreateConfig() {
        let config = await this.configRepo.findOne({ where: {} });
        if (!config) {
            config = this.configRepo.create({
                systemPrompt: this.getDefaultSystemPrompt(),
                customInstructions: '',
                faqs: '[]',
                businessHours: 'Lunes a Sábado 8:00 AM - 6:00 PM',
                businessPhone: '300 123 4567',
            });
            config = await this.configRepo.save(config);
        }
        return config;
    }
    getDefaultSystemPrompt() {
        return `Eres el asistente virtual de Servimos Norte, un servicio técnico de reparación de electrodomésticos ubicado en Bogotá, Colombia.

SOBRE LA EMPRESA:
- Reparamos: lavadoras, neveras, estufas, hornos, secadoras, lavavajillas y más
- Más de 15 años de experiencia
- Servicio a domicilio en toda Bogotá
- Garantía de 6 meses en reparaciones
- También vendemos repuestos y electrodomésticos reacondicionados

TU PERSONALIDAD:
- Amable, profesional y servicial
- Hablas siempre en español
- Respondes de forma clara y concisa
- Eres paciente (muchos clientes son adultos mayores)
- Usas emojis moderadamente para ser más amigable

CAPACIDADES:
- Puedes agendar reparaciones: pide tipo de equipo, marca, descripción del problema, nombre, dirección del cliente y día/hora para la visita.
- Puedes consultar el estado de reparaciones por número de teléfono
- Puedes informar sobre servicios y precios
- Puedes compartir información de productos disponibles
- Puedes entender audios que los clientes envían

AGENDAR REPARACIONES:
Cuando tengas TODA la información necesaria para agendar una reparación (tipo de equipo, marca, problema, nombre, dirección y día/hora para la visita), DEBES incluir al final de tu respuesta un bloque JSON así:

\`\`\`AGENDAR
{
  "action": "schedule_repair",
  "customerName": "Nombre del cliente",
  "customerAddress": "Dirección",
  "appointmentDate": "Día y hora para la visita",
  "applianceType": "Tipo de equipo",
  "brand": "Marca",
  "model": "Modelo (si lo dieron)",
  "problemDescription": "Descripción del problema"
}
\`\`\`

Este bloque será detectado automáticamente para crear el registro en el sistema. Solo inclúyelo cuando ya tengas toda la información confirmada.

REGLAS:
- NUNCA inventes información que no tengas
- Si no sabes algo, di que consultarás con un técnico
- Para emergencias o consultas complejas, sugiere llamar al número de la empresa
- Siempre confirma los datos antes de agendar una reparación
- Si recibes un audio transcrito, responde normalmente al contenido del audio`;
    }
    async getConversation(phone) {
        let conv = await this.convRepo.findOne({ where: { phone } });
        if (!conv) {
            conv = this.convRepo.create({ phone, messages: '[]' });
            conv = await this.convRepo.save(conv);
        }
        return conv;
    }
    async transcribeAudio(audioBuffer, mimeType) {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const audioData = audioBuffer.toString('base64');
            const result = await model.generateContent([
                { text: 'Transcribe el siguiente audio en español. Solo devuelve la transcripción del texto hablado, sin comentarios adicionales.' },
                {
                    inlineData: {
                        mimeType: mimeType || 'audio/ogg',
                        data: audioData,
                    },
                },
            ]);
            const transcription = result.response.text().trim();
            this.logger.log(`🎤 Audio transcribed: ${transcription.substring(0, 100)}`);
            return transcription || '[Audio no reconocido]';
        }
        catch (error) {
            this.logger.error(`Audio transcription error: ${error.message}`);
            return '[No se pudo transcribir el audio]';
        }
    }
    async processMessage(phone, userMessage, senderName) {
        try {
            const conv = await this.getConversation(phone);
            const config = await this.getOrCreateConfig();
            if (senderName && !conv.customerName) {
                conv.customerName = senderName;
            }
            let history = [];
            try {
                history = JSON.parse(conv.messages);
            }
            catch (e) {
                history = [];
            }
            if (history.length > 20)
                history = history.slice(-20);
            history.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });
            const contextData = await this.buildContextData(phone, userMessage);
            const systemPrompt = `${config.systemPrompt}\n\n${config.customInstructions}\n\nINFORMACIÓN ADICIONAL:\nHorario: ${config.businessHours}\nTeléfono: ${config.businessPhone}\nFecha actual: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\n${this.buildFaqsContext(config.faqs)}\n\n${contextData}`;
            const geminiHistory = history.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }],
            }));
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: systemPrompt,
            });
            const chat = model.startChat({ history: geminiHistory });
            const result = await chat.sendMessage(userMessage);
            const aiResponse = result.response.text();
            await this.handleAutoScheduling(phone, aiResponse, conv);
            const cleanResponse = this.cleanResponse(aiResponse);
            history.push({ role: 'model', content: cleanResponse, timestamp: new Date().toISOString() });
            conv.messages = JSON.stringify(history);
            await this.convRepo.save(conv);
            return cleanResponse;
        }
        catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            return '¡Disculpa! Tuve un problema procesando tu mensaje. Por favor intenta de nuevo o llámanos al 300 123 4567. 📞';
        }
    }
    cleanResponse(response) {
        return response.replace(/```AGENDAR[\s\S]*?```/g, '').trim();
    }
    async handleAutoScheduling(phone, aiResponse, conv) {
        const lower = aiResponse.toLowerCase();
        const schedulingPhrases = [
            'he agendado', 'ha sido agendada', 'reparación agendada', 'cita agendada',
            'registrada exitosamente', 'hemos agendado', 'queda agendada', 'servicio agendado',
            'visita agendada', 'tu reparación', 'hemos registrado', 'queda registrada',
            'agenda confirmada', 'cita confirmada', 'solicitud registrada', 'solicitud agendada',
            'programada', 'tu cita', 'hemos programado', 'está agendad',
        ];
        const hasSchedulingIntent = schedulingPhrases.some(phrase => lower.includes(phrase));
        if (!hasSchedulingIntent)
            return;
        this.logger.log(`🔍 Scheduling intent detected in AI response, extracting data...`);
        try {
            let history = [];
            try {
                history = JSON.parse(conv.messages);
            }
            catch {
                history = [];
            }
            const conversationText = history.slice(-10).map(m => `${m.role === 'user' ? 'CLIENTE' : 'BOT'}: ${m.content}`).join('\n');
            const extractionPrompt = `Analiza la siguiente conversación de WhatsApp entre un cliente y un bot de servicio técnico de reparación.
El bot acaba de confirmar que agendó una reparación. Extrae los datos en formato JSON PURO (sin markdown, sin backticks).

Conversación:
${conversationText}

Última respuesta del bot:
${aiResponse}

Extrae SOLO un JSON con estos campos (usa "No especificado" si no se mencionó):
{"customerName":"nombre","customerAddress":"dirección","appointmentDate":"día y hora de la cita","applianceType":"tipo de equipo","brand":"marca","model":"modelo","problemDescription":"descripción del problema"}`;
            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(extractionPrompt);
            const extractedText = result.response.text().trim();
            let jsonStr = extractedText;
            const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
            if (jsonMatch)
                jsonStr = jsonMatch[0];
            const data = JSON.parse(jsonStr);
            this.logger.log(`📋 Extracted repair data: ${JSON.stringify(data)}`);
            const cleanPhone = phone.replace('@c.us', '').replace('@lid', '');
            let customerId;
            const existing = await this.customersService.findAll(cleanPhone);
            if (existing.length > 0) {
                const customer = existing[0];
                customerId = customer.id;
                this.logger.log(`👤 Existing customer: ${customer.fullName}`);
                let updated = false;
                const updateData = {};
                const parsedName = data.customerName || conv.customerName;
                if (parsedName && parsedName !== 'No especificado' &&
                    (customer.fullName === 'Cliente WhatsApp' || !customer.fullName)) {
                    updateData.fullName = parsedName;
                    updated = true;
                }
                if (data.customerAddress && data.customerAddress !== 'No especificada' && !customer.address) {
                    updateData.address = data.customerAddress;
                    updated = true;
                }
                if (updated) {
                    await this.customersService.update(customerId, updateData);
                    this.logger.log(`👤 Existing customer updated with new details: ${JSON.stringify(updateData)}`);
                }
            }
            else {
                const customerName = data.customerName || conv.customerName || 'Cliente WhatsApp';
                const newCustomer = await this.customersService.create({
                    fullName: customerName,
                    phone: cleanPhone,
                    email: '',
                    address: data.customerAddress || '',
                    notes: 'Registrado automáticamente por bot de WhatsApp',
                });
                customerId = newCustomer.id;
                this.logger.log(`👤 New customer created: ${customerName} (${customerId})`);
            }
            const repair = await this.repairsService.create({
                customerId,
                applianceType: data.applianceType || 'No especificado',
                brand: data.brand || 'No especificada',
                model: data.model || '',
                appointmentDate: data.appointmentDate || 'No especificada',
                problemDescription: data.problemDescription || 'Agendado por bot de WhatsApp',
                technicianNotes: `Agendado automáticamente por bot de WhatsApp\nTeléfono: ${cleanPhone}\nCliente: ${data.customerName || conv.customerName}\nFecha: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`,
            });
            this.logger.log(`✅ REPAIR CREATED: ID=${repair.id} | ${data.applianceType} ${data.brand} | Customer=${customerId}`);
        }
        catch (error) {
            this.logger.error(`❌ Error in auto-scheduling extraction: ${error.message}`);
        }
    }
    async buildContextData(phone, message) {
        let context = '';
        const cleanPhone = phone.replace('@c.us', '');
        try {
            const customers = await this.customersService.findAll(cleanPhone);
            if (customers.length > 0) {
                const customer = customers[0];
                context += `\nCLIENTE IDENTIFICADO: ${customer.fullName} (Tel: ${customer.phone})`;
                const repairs = await this.repairsService.findAll();
                const customerRepairs = repairs.filter(r => r.customer?.phone === cleanPhone);
                if (customerRepairs.length > 0) {
                    context += `\nREPARACIONES DEL CLIENTE:`;
                    customerRepairs.forEach(r => {
                        context += `\n- ${r.applianceType} ${r.brand}: Estado=${r.status}, Costo=$${r.cost}`;
                    });
                }
            }
        }
        catch (e) { }
        const lowerMsg = message.toLowerCase();
        if (lowerMsg.includes('product') || lowerMsg.includes('repuesto') || lowerMsg.includes('venta') ||
            lowerMsg.includes('comprar') || lowerMsg.includes('precio') || lowerMsg.includes('tienda')) {
            try {
                const products = await this.productsService.findAll();
                if (products.length > 0) {
                    context += `\nPRODUCTOS DISPONIBLES:`;
                    products.slice(0, 10).forEach(p => {
                        context += `\n- ${p.name} (${p.category}): $${p.price} COP, Stock: ${p.stock}`;
                    });
                }
            }
            catch (e) { }
        }
        return context;
    }
    buildFaqsContext(faqsJson) {
        try {
            const faqs = JSON.parse(faqsJson);
            if (faqs.length === 0)
                return '';
            let ctx = 'PREGUNTAS FRECUENTES (responde basándote en estas si aplica):';
            faqs.forEach((f) => { ctx += `\nP: ${f.question}\nR: ${f.answer}`; });
            return ctx;
        }
        catch {
            return '';
        }
    }
    async clearConversation(phone) {
        const conv = await this.convRepo.findOne({ where: { phone } });
        if (conv) {
            conv.messages = '[]';
            await this.convRepo.save(conv);
        }
    }
    async getAllConversations() {
        return this.convRepo.find({ order: { lastActivity: 'DESC' } });
    }
};
exports.ChatbotAiService = ChatbotAiService;
exports.ChatbotAiService = ChatbotAiService = ChatbotAiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __param(1, (0, typeorm_1.InjectRepository)(bot_config_entity_1.BotConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        customers_service_1.CustomersService,
        repairs_service_1.RepairsService,
        products_service_1.ProductsService])
], ChatbotAiService);
//# sourceMappingURL=chatbot-ai.service.js.map