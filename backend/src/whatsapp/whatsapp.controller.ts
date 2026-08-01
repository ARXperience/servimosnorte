import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WhatsappService } from './whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
    constructor(private service: WhatsappService) { }

    @Get('report-link')
    @ApiOperation({ summary: 'Generar enlace de WhatsApp para reporte' })
    @ApiQuery({ name: 'phone', example: '3001234567' })
    @ApiQuery({ name: 'token', example: 'uuid-token' })
    @ApiQuery({ name: 'name', example: 'María García' })
    reportLink(
        @Query('phone') phone: string,
        @Query('token') token: string,
        @Query('name') name: string,
    ) {
        return { url: this.service.generateReportLink(phone, token, name) };
    }

    @Get('message-link')
    @ApiOperation({ summary: 'Generar enlace de WhatsApp con mensaje personalizado' })
    @ApiQuery({ name: 'phone', example: '3001234567' })
    @ApiQuery({ name: 'message', example: 'Hola, su reparación está lista' })
    messageLink(
        @Query('phone') phone: string,
        @Query('message') message: string,
    ) {
        return { url: this.service.generateGenericMessage(phone, message) };
    }
}
