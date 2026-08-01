import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Conversation } from './entities/conversation.entity';
import { BotConfig } from './entities/bot-config.entity';
import { CustomersService } from '../customers/customers.service';
import { RepairsService } from '../repairs/repairs.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ChatbotAiService {
    private readonly logger = new Logger(ChatbotAiService.name);
    private genAI: GoogleGenerativeAI;

    constructor(
        @InjectRepository(Conversation) private convRepo: Repository<Conversation>,
        @InjectRepository(BotConfig) private configRepo: Repository<BotConfig>,
        private customersService: CustomersService,
        private repairsService: RepairsService,
        private productsService: ProductsService,
    ) {
        const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBNEWC8AUqb6KxXvMaGkvpv42OA4gxI0cs';
        this.genAI = new GoogleGenerativeAI(apiKey);
    }

    async getOrCreateConfig(): Promise<BotConfig> {
        let config = await this.configRepo.findOne({ where: {} });
        if (!config) {
            config = this.configRepo.create({
                systemPrompt: this.getDefaultSystemPrompt(),
                customInstructions: '',
                faqs: '[]',
                businessHours: 'Lunes a Sábado 8:00 AM - 6:00 PM',
                businessPhone: '312 584 6294',
            });
            config = await this.configRepo.save(config);
        }
        return config;
    }

    private getDefaultSystemPrompt(): string {
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

FORMATO DE RESPUESTA (MUY IMPORTANTE):
- WhatsApp NO soporta formato Markdown. NUNCA uses sintaxis Markdown.
- NUNCA escribas links así: [texto](url) o [url](url). Eso se ve roto en WhatsApp.
- Siempre escribe las URLs como texto plano. Ejemplo correcto: Visita nuestra tienda en https://www.servimosnorte.com/tienda
- NO uses asteriscos dobles **texto** para negritas. En WhatsApp las negritas son con asterisco simple *texto*.
- NO uses # para títulos. Simplemente escribe el texto.
- Usa emojis para organizar visualmente en vez de listas con guiones.

REGLAS:
- NUNCA inventes información que no tengas
- Si no sabes algo, di que consultarás con un técnico
- Para emergencias o consultas complejas, sugiere llamar al número de la empresa
- Siempre confirma los datos antes de agendar una reparación
- Si recibes un audio transcrito, responde normalmente al contenido del audio`;
    }

    async getConversation(phone: string): Promise<Conversation> {
        let conv = await this.convRepo.findOne({ where: { phone } });
        if (!conv) {
            conv = this.convRepo.create({ phone, messages: '[]' });
            conv = await this.convRepo.save(conv);
        }
        return conv;
    }

    // Audio transcription via Gemini multimodal
    async transcribeAudio(audioBuffer: Buffer, mimeType: string): Promise<string> {
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
        } catch (error) {
            this.logger.error(`Audio transcription error: ${error.message}`);
            return '[No se pudo transcribir el audio]';
        }
    }

    async processMessage(phone: string, userMessage: string, senderName?: string): Promise<string> {
        try {
            // Auto-register customer on every conversation
            await this.ensureCustomerRegistered(phone, senderName);

            const conv = await this.getConversation(phone);
            const config = await this.getOrCreateConfig();

            if (senderName && !conv.customerName) {
                conv.customerName = senderName;
            }

            // Parse conversation history
            let history: Array<{ role: string; content: string; timestamp: string }> = [];
            try { history = JSON.parse(conv.messages); } catch (e) { history = []; }

            // Keep last 20 messages for context
            if (history.length > 20) history = history.slice(-20);

            // Add user message to history
            history.push({ role: 'user', content: userMessage, timestamp: new Date().toISOString() });

            // Build context with real data
            const contextData = await this.buildContextData(phone, userMessage);

            // Build Gemini prompt
            let systemPrompt = `${config.systemPrompt}\n\n${config.customInstructions}\n\nINFORMACIÓN ADICIONAL:\nHorario: ${config.businessHours}\nTeléfono: ${config.businessPhone}\nFecha actual: ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\n${this.buildFaqsContext(config.faqs)}\n\n${contextData}`;
            
            if (phone.includes('@lid')) {
                systemPrompt += `\n\nIMPORTANTE: El número de teléfono de este cliente está oculto por privacidad de WhatsApp. DEBES pedirle amablemente su número de celular (ej. 315...) para poder registrar el agendamiento de su reparación.`;
            }

            // Build chat history for Gemini
            const geminiHistory = history.slice(0, -1).map(m => ({
                role: m.role === 'user' ? 'user' as const : 'model' as const,
                parts: [{ text: m.content }],
            }));

            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: systemPrompt,
            });

            const chat = model.startChat({ history: geminiHistory });
            const result = await chat.sendMessage(userMessage);
            const aiResponse = result.response.text();

            // Check for auto-scheduling in AI response (pass full history including current user message)
            await this.handleAutoScheduling(phone, aiResponse, conv, history);

            // Clean the response (remove the JSON block from what user sees)
            const cleanResponse = this.cleanResponse(aiResponse);

            // Add AI response to history
            history.push({ role: 'model', content: cleanResponse, timestamp: new Date().toISOString() });
            conv.messages = JSON.stringify(history);
            await this.convRepo.save(conv);

            return cleanResponse;
        } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            return '¡Disculpa! Tuve un problema procesando tu mensaje. Por favor intenta de nuevo o llámanos al 312 584 6294. 📞';
        }
    }

    private async ensureCustomerRegistered(phone: string, senderName?: string): Promise<void> {
        try {
            const cleanPhone = phone.replace('@c.us', '').replace('@lid', '');
            const existing = await this.customersService.findAll(cleanPhone);

            if (existing.length > 0) {
                // Update name if we have a better one
                const customer = existing[0];
                if (senderName && senderName !== 'Cliente' &&
                    (customer.fullName === 'Cliente WhatsApp' || !customer.fullName)) {
                    await this.customersService.update(customer.id, { fullName: senderName });
                    this.logger.log(`👤 Customer name updated: ${senderName}`);
                }
            } else {
                // Create new customer
                await this.customersService.create({
                    fullName: senderName && senderName !== 'Cliente' ? senderName : 'Cliente WhatsApp',
                    phone: cleanPhone,
                    whatsappId: cleanPhone,
                    email: '',
                    address: '',
                    notes: 'Registrado automáticamente por bot de WhatsApp',
                });
                this.logger.log(`👤 New customer auto-registered: ${senderName || 'Cliente WhatsApp'} (${cleanPhone})`);
            }
        } catch (error) {
            this.logger.error(`Error auto-registering customer: ${error.message}`);
        }
    }

    private cleanResponse(response: string): string {
        let cleaned = response;

        // Remove any AGENDAR JSON block if somehow present
        cleaned = cleaned.replace(/```AGENDAR[\s\S]*?```/g, '');

        // Fix markdown links: [text](url) → just the url
        // This handles cases like [https://servimosnorte.com/tienda](https://servimosnorte.com/tienda)
        cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
            // If the text is itself a URL, just return the url portion (avoids duplication)
            if (text.startsWith('http') || text.startsWith('www.')) {
                return url.startsWith('http') ? url : `https://${url}`;
            }
            // If text is descriptive (e.g. "nuestra tienda"), return "text: url"
            return `${text}: ${url.startsWith('http') ? url : 'https://' + url}`;
        });

        // Remove any remaining markdown bold (**text**) → WhatsApp bold (*text*)
        cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '*$1*');

        // Remove markdown headers (### text → text)
        cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

        // Remove backtick code formatting
        cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

        return cleaned.trim();
    }

    private async handleAutoScheduling(phone: string, aiResponse: string, conv: Conversation, currentHistory?: Array<{ role: string; content: string; timestamp: string }>) {
        // PASO 0: Intentar parsear bloque AGENDAR directo del AI (más confiable)
        const agendarMatch = aiResponse.match(/```AGENDAR\s*([\s\S]*?)```/);
        if (agendarMatch) {
            try {
                const data = JSON.parse(agendarMatch[1].trim());
                this.logger.log(`📋 AGENDAR block parsed directly: ${JSON.stringify(data)}`);
                await this.createCustomerAndRepair(phone, data, conv);
                return; // Successfully registered via AGENDAR block
            } catch (e) {
                this.logger.error(`Error parsing AGENDAR block: ${e.message}`);
                // Fall through to phrase-based detection
            }
        }

        // PASO 1: Detect if the AI response indicates a repair was scheduled (fallback)
        const lower = aiResponse.toLowerCase();
        const schedulingPhrases = [
            'he agendado', 'ha sido agendada', 'reparación agendada', 'cita agendada',
            'registrada exitosamente', 'hemos agendado', 'queda agendada', 'servicio agendado',
            'visita agendada', 'tu reparación', 'hemos registrado', 'queda registrada',
            'agenda confirmada', 'cita confirmada', 'solicitud registrada', 'solicitud agendada',
            'programada', 'tu cita', 'hemos programado', 'está agendad',
            // Frases adicionales para mejor cobertura
            'he registrado', 'quedó agendad', 'quedó registrad', 'ha quedado agendad',
            'ha quedado registrad', 'solicitud de reparación', 'servicio programado',
            'visita programada', 'visita confirmada', 'he tomado nota', 'datos de la reparación',
            'reparación confirmada', 'reparación registrada', 'agendada tu',
        ];

        const hasSchedulingIntent = schedulingPhrases.some(phrase => lower.includes(phrase));
        if (!hasSchedulingIntent) return;

        this.logger.log(`🔍 Scheduling intent detected in AI response, extracting data...`);

        // PASO 2: Extract structured data using a second Gemini call (with FULL history)
        try {
            // Use current history passed from processMessage (includes current user message)
            let history: Array<{ role: string; content: string }> = [];
            if (currentHistory && currentHistory.length > 0) {
                history = currentHistory;
            } else {
                try { history = JSON.parse(conv.messages); } catch { history = []; }
            }

            // Build a summary of the conversation for extraction
            const conversationText = history.slice(-10).map(m =>
                `${m.role === 'user' ? 'CLIENTE' : 'BOT'}: ${m.content}`
            ).join('\n');

            const extractionPrompt = `Analiza la siguiente conversación de WhatsApp entre un cliente y un bot de servicio técnico de reparación.
El bot acaba de confirmar que agendó una reparación. Extrae los datos en formato JSON PURO (sin markdown, sin backticks).

Conversación:
${conversationText}

Última respuesta del bot:
${aiResponse}

Extrae SOLO un JSON con estos campos (usa "No especificado" si no se mencionó):
{"customerName":"nombre","customerPhone":"teléfono real del cliente si lo dio","customerAddress":"dirección","appointmentDate":"día y hora de la cita","applianceType":"tipo de equipo","brand":"marca","model":"modelo","problemDescription":"descripción del problema"}`;

            const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(extractionPrompt);
            const extractedText = result.response.text().trim();

            // Parse the JSON from the response (handle possible markdown wrapping)
            let jsonStr = extractedText;
            const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) jsonStr = jsonMatch[0];

            const data = JSON.parse(jsonStr);
            this.logger.log(`📋 Extracted repair data: ${JSON.stringify(data)}`);

            await this.createCustomerAndRepair(phone, data, conv);
        } catch (error) {
            this.logger.error(`❌ Error in auto-scheduling extraction: ${error.message}`);
        }
    }

    private async createCustomerAndRepair(phone: string, data: any, conv: Conversation): Promise<void> {
        const cleanPhone = phone.replace('@c.us', '').replace('@lid', '');

        // 1. Find or create customer
        let customerId: string;
        const existing = await this.customersService.findAll(cleanPhone);

        if (existing.length > 0) {
            const customer = existing[0];
            customerId = customer.id;
            this.logger.log(`👤 Existing customer: ${customer.fullName}`);

            let updated = false;
            const updateData: any = {};
            const parsedName = data.customerName || conv.customerName;

            if (parsedName && parsedName !== 'No especificado' &&
                (customer.fullName === 'Cliente WhatsApp' || !customer.fullName)) {
                updateData.fullName = parsedName;
                updated = true;
            }

            if (data.customerAddress && data.customerAddress !== 'No especificada' && data.customerAddress !== 'No especificado' && !customer.address) {
                updateData.address = data.customerAddress;
                updated = true;
            }

            if (data.customerPhone && data.customerPhone !== 'No especificado' && data.customerPhone !== customer.phone) {
                updateData.phone = data.customerPhone;
                updated = true;
            }

            if (updated) {
                await this.customersService.update(customerId, updateData);
                this.logger.log(`👤 Existing customer updated with new details: ${JSON.stringify(updateData)}`);
            }
        } else {
            const customerName = data.customerName || conv.customerName || 'Cliente WhatsApp';
            const newCustomer = await this.customersService.create({
                fullName: customerName,
                phone: data.customerPhone && data.customerPhone !== 'No especificado' ? data.customerPhone : cleanPhone,
                whatsappId: cleanPhone,
                email: '',
                address: data.customerAddress || '',
                notes: 'Registrado automáticamente por bot de WhatsApp',
            });
            customerId = newCustomer.id;
            this.logger.log(`👤 New customer created: ${customerName} (${customerId})`);
        }

        // 2. Create repair
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

    private async buildContextData(phone: string, message: string): Promise<string> {
        let context = '';
        const cleanPhone = phone.replace('@c.us', '');

        // Check if customer exists
        try {
            const customers = await this.customersService.findAll(cleanPhone);
            if (customers.length > 0) {
                const customer = customers[0];
                context += `\nCLIENTE IDENTIFICADO: ${customer.fullName} (Tel: ${customer.phone})`;

                // Get their repairs
                const repairs = await this.repairsService.findAll();
                const customerRepairs = repairs.filter(r => r.customer?.phone === cleanPhone);
                if (customerRepairs.length > 0) {
                    context += `\nREPARACIONES DEL CLIENTE:`;
                    customerRepairs.forEach(r => {
                        context += `\n- ${r.applianceType} ${r.brand}: Estado=${r.status}, Costo=$${r.cost}`;
                    });
                }
            }
        } catch (e) { /* silent */ }

        // If asking about products
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
            } catch (e) { /* silent */ }
        }

        return context;
    }

    private buildFaqsContext(faqsJson: string): string {
        try {
            const faqs = JSON.parse(faqsJson);
            if (faqs.length === 0) return '';
            let ctx = 'PREGUNTAS FRECUENTES (responde basándote en estas si aplica):';
            faqs.forEach((f: any) => { ctx += `\nP: ${f.question}\nR: ${f.answer}`; });
            return ctx;
        } catch { return ''; }
    }

    async clearConversation(phone: string): Promise<void> {
        const conv = await this.convRepo.findOne({ where: { phone } });
        if (conv) {
            conv.messages = '[]';
            await this.convRepo.save(conv);
        }
    }

    async deleteConversation(phone: string): Promise<void> {
        await this.convRepo.softDelete({ phone });
    }

    async getAllConversations(): Promise<Conversation[]> {
        return this.convRepo.find({ order: { lastActivity: 'DESC' } });
    }

    async addManualMessage(phone: string, content: string): Promise<void> {
        const conv = await this.getConversation(phone);
        let history: Array<{ role: string; content: string; timestamp: string }> = [];
        try { history = JSON.parse(conv.messages); } catch (e) { history = []; }
        // Se guarda como 'model' para que el usuario (frontend) lo vea como respuesta del bot/admin
        history.push({ role: 'model', content, timestamp: new Date().toISOString() });
        conv.messages = JSON.stringify(history);
        await this.convRepo.save(conv);
    }
}
