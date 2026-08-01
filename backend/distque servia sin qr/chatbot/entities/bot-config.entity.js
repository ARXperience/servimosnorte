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
exports.BotConfig = void 0;
const typeorm_1 = require("typeorm");
let BotConfig = class BotConfig {
};
exports.BotConfig = BotConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BotConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], BotConfig.prototype, "systemPrompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '' }),
    __metadata("design:type", String)
], BotConfig.prototype, "customInstructions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', default: '[]' }),
    __metadata("design:type", String)
], BotConfig.prototype, "faqs", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Lunes a Sábado 8:00 AM - 6:00 PM' }),
    __metadata("design:type", String)
], BotConfig.prototype, "businessHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '300 123 4567' }),
    __metadata("design:type", String)
], BotConfig.prototype, "businessPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], BotConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BotConfig.prototype, "updatedAt", void 0);
exports.BotConfig = BotConfig = __decorate([
    (0, typeorm_1.Entity)('bot_config')
], BotConfig);
//# sourceMappingURL=bot-config.entity.js.map