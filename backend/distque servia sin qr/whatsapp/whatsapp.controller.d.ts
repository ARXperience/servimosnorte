import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private service;
    constructor(service: WhatsappService);
    reportLink(phone: string, token: string, name: string): {
        url: string;
    };
    messageLink(phone: string, message: string): {
        url: string;
    };
}
