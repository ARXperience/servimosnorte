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
exports.UpdateRepairDto = exports.CreateRepairDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const repair_entity_1 = require("../entities/repair.entity");
class CreateRepairDto {
}
exports.CreateRepairDto = CreateRepairDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-del-cliente' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Licuadora' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "applianceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Samsung' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WF45R6100AW', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'No enciende, hace ruido al intentar iniciar ciclo' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "problemDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Motor dañado, requiere reemplazo', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "diagnostic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 250000, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateRepairDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3-5 días hábiles', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "estimatedTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lunes 15 a las 3pm', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRepairDto.prototype, "technicianNotes", void 0);
class UpdateRepairDto {
}
exports.UpdateRepairDto = UpdateRepairDto;
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "applianceType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "brand", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "model", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "problemDescription", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "diagnostic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateRepairDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "estimatedTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "appointmentDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, enum: repair_entity_1.RepairStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(repair_entity_1.RepairStatus),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRepairDto.prototype, "technicianNotes", void 0);
//# sourceMappingURL=repair.dto.js.map