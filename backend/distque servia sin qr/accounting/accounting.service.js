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
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../payments/entities/payment.entity");
const repair_entity_1 = require("../repairs/entities/repair.entity");
const order_entity_1 = require("../orders/entities/order.entity");
let AccountingService = class AccountingService {
    constructor(paymentRepo, repairRepo, orderRepo) {
        this.paymentRepo = paymentRepo;
        this.repairRepo = repairRepo;
        this.orderRepo = orderRepo;
    }
    async getDashboardStats() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalRepairs, totalOrders, monthlyPayments, pendingPayments,] = await Promise.all([
            this.repairRepo.count(),
            this.orderRepo.count(),
            this.paymentRepo.find({
                where: {
                    status: payment_entity_1.PaymentStatusEnum.COMPLETED,
                    createdAt: (0, typeorm_2.Between)(startOfMonth, now),
                },
            }),
            this.paymentRepo.find({
                where: { status: payment_entity_1.PaymentStatusEnum.PENDING },
            }),
        ]);
        let monthlyRevenue = 0;
        let repairIncome = 0;
        let productSales = 0;
        monthlyPayments.forEach((p) => {
            const amount = Number(p.amount);
            monthlyRevenue += amount;
            if (p.repairId)
                repairIncome += amount;
            if (p.orderId)
                productSales += amount;
        });
        let pendingTotal = 0;
        pendingPayments.forEach((p) => { pendingTotal += Number(p.amount); });
        return {
            totalRepairs,
            totalOrders,
            monthlyRevenue,
            repairIncome,
            productSales,
            pendingTotal,
            pendingCount: pendingPayments.length,
        };
    }
    async getRevenueReport(startDate, endDate) {
        const payments = await this.paymentRepo.find({
            where: {
                status: payment_entity_1.PaymentStatusEnum.COMPLETED,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['repair', 'order'],
            order: { createdAt: 'ASC' },
        });
        return payments.map((p) => ({
            id: p.id,
            fecha: p.createdAt,
            monto: p.amount,
            metodo: p.method,
            tipo: p.repairId ? 'Reparación' : 'Venta',
            descripcion: p.description,
            transaccion: p.transactionId,
        }));
    }
    async exportCSV(startDate, endDate) {
        const data = await this.getRevenueReport(startDate, endDate);
        const headers = 'ID,Fecha,Monto,Método,Tipo,Descripción\n';
        const rows = data.map((d) => `${d.id},${d.fecha},${d.monto},${d.metodo},${d.tipo},"${d.descripcion || ''}"`).join('\n');
        return headers + rows;
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(repair_entity_1.Repair)),
    __param(2, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map