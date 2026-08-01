import { ConfigService } from '@nestjs/config';
export declare class WhatsappService {
    private config;
    private frontendUrl;
    constructor(config: ConfigService);
    generateReportLink(phone: string, publicToken: string, customerName: string): string;
    generatePaymentLink(phone: string, amount: number, description: string): string;
    generateGenericMessage(phone: string, message: string): string;
}
