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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const whatsapp_service_1 = require("./whatsapp.service");
let WhatsappController = class WhatsappController {
    constructor(service) {
        this.service = service;
    }
    reportLink(phone, token, name) {
        return { url: this.service.generateReportLink(phone, token, name) };
    }
    messageLink(phone, message) {
        return { url: this.service.generateGenericMessage(phone, message) };
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('report-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar enlace de WhatsApp para reporte' }),
    (0, swagger_1.ApiQuery)({ name: 'phone', example: '3001234567' }),
    (0, swagger_1.ApiQuery)({ name: 'token', example: 'uuid-token' }),
    (0, swagger_1.ApiQuery)({ name: 'name', example: 'María García' }),
    __param(0, (0, common_1.Query)('phone')),
    __param(1, (0, common_1.Query)('token')),
    __param(2, (0, common_1.Query)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "reportLink", null);
__decorate([
    (0, common_1.Get)('message-link'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar enlace de WhatsApp con mensaje personalizado' }),
    (0, swagger_1.ApiQuery)({ name: 'phone', example: '3001234567' }),
    (0, swagger_1.ApiQuery)({ name: 'message', example: 'Hola, su reparación está lista' }),
    __param(0, (0, common_1.Query)('phone')),
    __param(1, (0, common_1.Query)('message')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "messageLink", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map