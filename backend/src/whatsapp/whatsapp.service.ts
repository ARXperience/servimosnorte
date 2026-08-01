import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
    private frontendUrl: string;

    constructor(private config: ConfigService) {
        this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    }

    generateReportLink(phone: string, publicToken: string, customerName: string): string {
        const reportUrl = `${this.frontendUrl}/reporte?id=${publicToken}`;
        const message = `Hola ${customerName}, su diagnóstico de electrodoméstico está listo. Revise su reporte de reparación aquí: ${reportUrl}. Puede aceptar o rechazar la reparación.`;
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }

    generatePaymentLink(phone: string, amount: number, description: string): string {
        const message = `Hola, su pago de $${amount.toLocaleString('es-CO')} COP por "${description}" ha sido registrado en Servimos Norte. ¡Gracias por su confianza!`;
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }

    generateGenericMessage(phone: string, message: string): string {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }
}
