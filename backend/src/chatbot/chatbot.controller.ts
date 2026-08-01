import { Controller, Get, Post, Put, Delete, Body, Res, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ChatbotService } from './chatbot.service';
import { ChatbotAiService } from './chatbot-ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotConfig } from './entities/bot-config.entity';
import * as QRCode from 'qrcode';

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
    constructor(
        private chatbotService: ChatbotService,
        private aiService: ChatbotAiService,
        @InjectRepository(BotConfig) private configRepo: Repository<BotConfig>,
    ) { }

    @Post('connect')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Initialize WhatsApp connection' })
    async connect() {
        await this.chatbotService.initialize();
        return { message: 'Conexión WhatsApp iniciada' };
    }

    @Get('qr')
    @ApiOperation({ summary: 'Get QR code as image' })
    async getQR(@Res() res: Response) {
        const qr = this.chatbotService.getQRCode();
        if (!qr) {
            return res.json({ qr: null, message: 'No QR available' });
        }
        try {
            const qrDataUrl = await QRCode.toDataURL(qr, { width: 400, margin: 2 });
            return res.json({ qr: qrDataUrl });
        } catch (e) {
            return res.json({ qr: null, message: 'Error generating QR' });
        }
    }

    @Get('status')
    @ApiOperation({ summary: 'Get WhatsApp connection status' })
    getStatus() {
        return this.chatbotService.getStatus();
    }

    @Post('disconnect')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Disconnect WhatsApp' })
    async disconnect() {
        await this.chatbotService.disconnect();
        return { message: 'Desconectado' };
    }

    @Get('config')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get bot configuration' })
    async getConfig() {
        return this.aiService.getOrCreateConfig();
    }

    @Put('config')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update bot configuration' })
    async updateConfig(@Body() body: {
        systemPrompt?: string;
        customInstructions?: string;
        faqs?: string;
        businessHours?: string;
        businessPhone?: string;
        isActive?: boolean;
    }) {
        const config = await this.aiService.getOrCreateConfig();
        Object.assign(config, body);
        return this.configRepo.save(config);
    }

    @Get('conversations')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all conversations' })
    async getConversations() {
        return this.aiService.getAllConversations();
    }

    @Delete('conversation/:phone')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete conversation by phone' })
    async deleteConversation(@Param('phone') phone: string) {
        await this.aiService.deleteConversation(phone);
        return { message: 'Conversación eliminada' };
    }

    @Post('test-message')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Test bot with a message (without WhatsApp)' })
    async testMessage(@Body() body: { message: string; phone?: string }) {
        const phone = body.phone || 'test-admin';
        const response = await this.aiService.processMessage(phone, body.message, 'Admin Test');
        return { response };
    }

    @Post('send-message')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send a manual message to a user via WhatsApp' })
    async sendManualMessage(@Body() body: { phone: string; message: string }) {
        if (!body.phone || !body.message) throw new Error('Phone and message are required');
        await this.chatbotService.sendManualMessage(body.phone, body.message);
        return { success: true };
    }
}
