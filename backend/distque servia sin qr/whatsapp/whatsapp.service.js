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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsappService = class WhatsappService {
    constructor(config) {
        this.config = config;
        this.frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
    }
    generateReportLink(phone, publicToken, customerName) {
        const reportUrl = `${this.frontendUrl}/reporte?id=${publicToken}`;
        const message = `Hola ${customerName}, su diagnóstico de electrodoméstico está listo. Revise su reporte de reparación aquí: ${reportUrl}. Puede aceptar o rechazar la reparación.`;
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }
    generatePaymentLink(phone, amount, description) {
        const message = `Hola, su pago de $${amount.toLocaleString('es-CO')} COP por "${description}" ha sido registrado en Servimos Norte. ¡Gracias por su confianza!`;
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }
    generateGenericMessage(phone, message) {
        const cleanPhone = phone.replace(/\D/g, '');
        const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`;
        return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map