import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendNotificationEmail(to: string, subject: string, html: string) {
        try {
            const from = this.configService.get<string>('SMTP_USER');
            if (!from) {
                this.logger.warn('SMTP_USER no configurado. No se envió el correo.');
                return;
            }
            await this.transporter.sendMail({
                from: `"Servimos Norte" <${from}>`,
                to,
                subject,
                html,
            });
            this.logger.log(`Email enviado a ${to}: ${subject}`);
        } catch (error) {
            this.logger.error(`Error enviando email a ${to}:`, error);
        }
    }
}
