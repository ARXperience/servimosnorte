import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotConfig } from './entities/bot-config.entity';
import { ChatbotAiService } from './chatbot-ai.service';
import * as fs from 'fs';
import * as path from 'path';

let makeWASocket: any;
let useMultiFileAuthState: any;
let DisconnectReason: any;
let downloadMediaMessage: any;
let pino: any;
let QRCode: any;

@Injectable()
export class ChatbotService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(ChatbotService.name);
    private client: any = null;
    private qrCode: string | null = null;
    private isReady = false;
    private isInitializing = false;

    // --- Keep-alive & reconnection ---
    private keepAliveInterval: ReturnType<typeof setInterval> | null = null;
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 15;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    constructor(
        @InjectRepository(BotConfig) private configRepo: Repository<BotConfig>,
        private aiService: ChatbotAiService,
    ) { }

    private writeLog(msg: string) {
        try {
            const logPath = path.join(process.cwd(), 'uploads', 'whatsapp.log');
            if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
                fs.mkdirSync(path.join(process.cwd(), 'uploads'));
            }
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${msg}\n`);
            this.logger.log(msg);
        } catch(e) {}
    }

    async onModuleInit() {
        this.writeLog('=== Server Starting ===');
        try {
            const baileys = await import('@whiskeysockets/baileys');
            makeWASocket = baileys.default || baileys.makeWASocket;
            useMultiFileAuthState = baileys.useMultiFileAuthState;
            DisconnectReason = baileys.DisconnectReason;
            downloadMediaMessage = baileys.downloadMediaMessage;
            pino = (await import('pino')).default || require('pino');
            QRCode = await import('qrcode');
            this.writeLog('Baileys loaded successfully');
        } catch (e) {
            this.writeLog('Baileys not available, bot features disabled: ' + e.message);
        }
    }

    onModuleDestroy() {
        this.stopKeepAlive();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // ─── Keep-alive: sends presence update every 4 minutes ───
    private startKeepAlive() {
        this.stopKeepAlive();
        this.keepAliveInterval = setInterval(async () => {
            if (this.client && this.isReady) {
                try {
                    // Send "available" presence to keep the session alive
                    await this.client.sendPresenceUpdate('available');
                    this.writeLog('💓 Keep-alive presence sent');
                } catch (e) {
                    this.writeLog(`💔 Keep-alive failed: ${e.message}`);
                }
            }
        }, 4 * 60 * 1000); // every 4 minutes
        this.writeLog('💓 Keep-alive interval started (every 4 min)');
    }

    private stopKeepAlive() {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
            this.writeLog('💓 Keep-alive interval stopped');
        }
    }

    // ─── Exponential backoff delay ───
    private getReconnectDelay(): number {
        // 2s, 4s, 8s, 16s, 32s, 60s, 60s, ...
        const base = 2000;
        const delay = Math.min(base * Math.pow(2, this.reconnectAttempts), 60000);
        return delay;
    }

    async initialize(): Promise<void> {
        this.writeLog('Starting Baileys initialization...');
        if (!makeWASocket) {
            this.writeLog('Baileys not available');
            return;
        }

        if (this.client) {
            this.writeLog('Destroying previous client...');
            this.stopKeepAlive();
            try { this.client.end(undefined); } catch (e) { }
            this.client = null;
        }

        this.isInitializing = true;
        this.isReady = false;
        this.qrCode = null;

        try {
            const authPath = path.join(process.cwd(), '.baileys_auth');
            
            this.writeLog('Getting multi-file auth state...');
            const { state, saveCreds } = await useMultiFileAuthState(authPath);
            const { Browsers, fetchLatestBaileysVersion } = await import('@whiskeysockets/baileys');

            this.writeLog('Fetching latest WhatsApp Web version...');
            const { version } = await fetchLatestBaileysVersion();
            this.writeLog(`Using WA v${version.join('.')}`);

            this.writeLog('Calling makeWASocket...');
            const sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.macOS('Desktop'),
                markOnlineOnConnect: true,
                syncFullHistory: false,
                // Increase default timeouts to prevent premature disconnects
                connectTimeoutMs: 60_000,
                keepAliveIntervalMs: 30_000,     // Baileys internal ping every 30s
                retryRequestDelayMs: 250,
            });

            this.client = sock;

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on('connection.update', async (update: any) => {
                const { connection, lastDisconnect, qr } = update;
                if (qr) {
                    try {
                        this.writeLog('📱 QR Update received from WhatsApp, storing raw QR string...');
                        this.qrCode = qr;
                        this.writeLog('📱 QR string stored successfully');
                    } catch (err) {
                        this.writeLog('Error storing QR string: ' + err.message);
                    }
                }
                if (connection === 'close') {
                    this.stopKeepAlive();
                    const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
                    const reason = lastDisconnect?.error?.message || lastDisconnect?.error || 'unknown';
                    this.writeLog(`⚠️ Connection closed — statusCode: ${statusCode}, reason: ${reason}`);
                    this.isReady = false;
                    this.isInitializing = false;
                    this.qrCode = null;

                    // Handle each disconnect reason appropriately
                    if (statusCode === DisconnectReason.loggedOut) {
                        // User explicitly logged out — wipe auth & stop
                        this.writeLog('🚫 Session logged out by user. Clearing auth data.');
                        if (fs.existsSync(authPath)) {
                            fs.rmSync(authPath, { recursive: true, force: true });
                        }
                        this.client = null;
                        this.reconnectAttempts = 0;
                        return;
                    }

                    if (statusCode === DisconnectReason.restartRequired) {
                        // Immediate reconnect, no backoff needed
                        this.writeLog('🔄 Restart required, reconnecting immediately...');
                        this.reconnectAttempts = 0;
                        this.initialize();
                        return;
                    }

                    // For all other reasons, reconnect with exponential backoff
                    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                        const delay = this.getReconnectDelay();
                        this.reconnectAttempts++;
                        this.writeLog(`🔄 Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);
                        if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
                        this.reconnectTimer = setTimeout(() => {
                            this.initialize();
                        }, delay);
                    } else {
                        this.writeLog('❌ Max reconnect attempts reached. Giving up. Manual restart required.');
                        this.client = null;
                        this.reconnectAttempts = 0;
                    }
                } else if (connection === 'open') {
                    this.writeLog('✅ WhatsApp Bot connected and ready!');
                    this.isReady = true;
                    this.isInitializing = false;
                    this.qrCode = null;
                    this.reconnectAttempts = 0; // Reset backoff on success

                    // Start keep-alive heartbeat
                    this.startKeepAlive();

                    // Send initial presence to mark as online
                    try {
                        await sock.sendPresenceUpdate('available');
                        this.writeLog('📡 Initial presence set to available');
                    } catch (e) {
                        this.writeLog(`Could not set initial presence: ${e.message}`);
                    }
                }
            });

            sock.ev.on('messages.upsert', async (m: any) => {
                if (m.type === 'notify') {
                    for (const msg of m.messages) {
                        if (!msg.key.fromMe && msg.message) {
                            await this.handleIncomingMessage(msg, sock);
                        }
                    }
                }
            });
        } catch (error) {
            this.writeLog(`Error setting up Baileys client: ${error.message}`);
            this.isInitializing = false;
            this.client = null;
        }
    }

    private async handleIncomingMessage(msg: any, sock: any): Promise<void> {
        try {
            const remoteJid = msg.key.remoteJid;
            if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') return;

            const config = await this.aiService.getOrCreateConfig();
            if (!config.isActive) return;

            const phone = remoteJid.split('@')[0];
            const senderName = msg.pushName || 'Cliente';

            let textContent = '';
            
            const messageType = Object.keys(msg.message)[0];
            
            if (messageType === 'conversation') {
                textContent = msg.message.conversation;
            } else if (messageType === 'extendedTextMessage') {
                textContent = msg.message.extendedTextMessage?.text || '';
            } else if (messageType === 'audioMessage' || messageType === 'pttMessage') {
                this.writeLog(`🎤 Audio from ${senderName} (${phone})`);
                try {
                    const buffer = await downloadMediaMessage(
                        msg,
                        'buffer',
                        {},
                        { 
                            logger: pino({ level: 'silent' }),
                            reuploadRequest: sock.updateMediaMessage
                        }
                    );
                    
                    if (buffer) {
                        const mimetype = msg.message[messageType].mimetype;
                        const transcription = await this.aiService.transcribeAudio(buffer, mimetype);
                        textContent = `[Audio transcrito]: ${transcription}`;
                        this.writeLog(`🎤 Transcription: ${transcription.substring(0, 80)}...`);
                    } else {
                        textContent = '[El cliente envió un audio que no pudo ser procesado]';
                    }
                } catch (audioErr) {
                    this.writeLog(`Error processing audio: ${audioErr.message}`);
                    textContent = '[El cliente envió un audio que no pudo ser procesado]';
                }
            }

            if (!textContent || textContent.trim() === '') return;

            this.writeLog(`📩 Message from ${senderName} (${phone}): ${textContent.substring(0, 50)}...`);

            // --- ESCUDO ANTIBAN: Emulación de Comportamiento Humano ---
            // 1. Marcar como leído y simular tiempo de lectura (aprox 20ms por letra, max 4s)
            try { await sock.readMessages([msg.key]); } catch(e) {}
            const readDelay = Math.min(Math.max(textContent.length * 20, 1500), 4000);
            await new Promise(resolve => setTimeout(resolve, readDelay));

            // 2. Mostrar "Escribiendo..."
            try { await sock.sendPresenceUpdate('composing', remoteJid); } catch(e) {}

            // 3. Generar respuesta de IA (el tiempo de proceso simula pensamiento/escritura inicial)
            const response = await this.aiService.processMessage(phone, textContent, senderName);

            // 4. Simular tiempo de escritura restante (aprox 30ms por letra de la respuesta, min 2s, max 8s)
            const typingDelay = Math.min(Math.max(response.length * 30, 2000), 8000);
            
            // Si el delay es muy largo, refrescar el estado "escribiendo" a la mitad
            if (typingDelay > 5000) {
                await new Promise(resolve => setTimeout(resolve, typingDelay / 2));
                try { await sock.sendPresenceUpdate('composing', remoteJid); } catch(e) {}
                await new Promise(resolve => setTimeout(resolve, typingDelay / 2));
            } else {
                await new Promise(resolve => setTimeout(resolve, typingDelay));
            }

            // Ocultar "Escribiendo..." justo antes de enviar
            try { await sock.sendPresenceUpdate('paused', remoteJid); } catch(e) {}

            // Send response
            await sock.sendMessage(remoteJid, { text: response }, { quoted: msg });
            this.writeLog(`📤 Replied to ${senderName}`);
        } catch (error) {
            this.writeLog(`Error handling message: ${error.message}`);
            try {
                await sock.sendMessage(msg.key.remoteJid, { text: '¡Disculpa! Tuve un problema. Por favor intenta de nuevo o llámanos. 📞' });
            } catch (e) { /* silent */ }
        }
    }

    getQRCode(): string | null {
        return this.qrCode;
    }

    getStatus(): { connected: boolean; initializing: boolean; hasQR: boolean } {
        return {
            connected: this.isReady,
            initializing: this.isInitializing,
            hasQR: !!this.qrCode,
        };
    }

    async disconnect(): Promise<void> {
        this.stopKeepAlive();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.client) {
            try {
                this.client.logout();
                this.client.end(undefined);
            } catch (e) { /* silent */ }
            this.client = null;
            this.isReady = false;
            this.isInitializing = false;
            this.qrCode = null;
            
            const authPath = path.join(process.cwd(), '.baileys_auth');
            if (fs.existsSync(authPath)) {
                fs.rmSync(authPath, { recursive: true, force: true });
            }
            
            this.writeLog('WhatsApp disconnected');
        }
    }

    async sendManualMessage(phone: string, text: string): Promise<boolean> {
        if (!this.client || !this.isReady) {
            throw new Error('WhatsApp bot no está conectado.');
        }
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const remoteJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}@s.whatsapp.net`;
            
            // Simular que el admin está escribiendo
            try { await this.client.sendPresenceUpdate('composing', remoteJid); } catch(e) {}
            await new Promise(resolve => setTimeout(resolve, 1500));
            try { await this.client.sendPresenceUpdate('paused', remoteJid); } catch(e) {}
            
            await this.client.sendMessage(remoteJid, { text });
            
            // Guardar en DB
            await this.aiService.addManualMessage(phone, text);
            this.writeLog(`📤 Manual reply to ${phone}`);
            return true;
        } catch (error) {
            this.writeLog(`Error sending manual message: ${error.message}`);
            throw new Error(`Error enviando mensaje manual: ${error.message}`);
        }
    }

    async sendSystemNotification(phone: string, text: string): Promise<boolean> {
        if (!this.client || !this.isReady) {
            this.writeLog(`Cannot send notification to ${phone}, WhatsApp not connected.`);
            return false;
        }
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            const remoteJid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}@s.whatsapp.net`;
            
            // Envío INMEDIATO sin demoras de emulación humana
            await this.client.sendMessage(remoteJid, { text });
            this.writeLog(`🔔 System notification sent to ${phone}`);
            return true;
        } catch (error) {
            this.writeLog(`Error sending system notification to ${phone}: ${error.message}`);
            return false;
        }
    }
}
