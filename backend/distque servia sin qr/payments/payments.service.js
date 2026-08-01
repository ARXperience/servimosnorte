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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("./entities/payment.entity");
const repairs_service_1 = require("../repairs/repairs.service");
const orders_service_1 = require("../orders/orders.service");
const repair_entity_1 = require("../repairs/entities/repair.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const stripe_1 = require("stripe");
let PaymentsService = class PaymentsService {
    constructor(repo, repairsService, ordersService, config) {
        this.repo = repo;
        this.repairsService = repairsService;
        this.ordersService = ordersService;
        this.config = config;
        const stripeKey = this.config.get('STRIPE_SECRET_KEY');
        if (stripeKey && stripeKey !== 'sk_test_your_stripe_key_here') {
            this.stripe = new stripe_1.default(stripeKey, { apiVersion: '2023-10-16' });
        }
    }
    async createPayment(dto) {
        const payment = this.repo.create(dto);
        if (!dto.status && (dto.method === payment_entity_1.PaymentMethod.CASH || dto.method === payment_entity_1.PaymentMethod.TRANSFER)) {
            payment.status = payment_entity_1.PaymentStatusEnum.COMPLETED;
        }
        const saved = await this.repo.save(payment);
        if (saved.status === payment_entity_1.PaymentStatusEnum.COMPLETED) {
            await this.updateRelatedStatus(saved);
        }
        return saved;
    }
    async createStripeCheckout(dto) {
        if (!this.stripe) {
            throw new Error('Stripe no está configurado. Agregue STRIPE_SECRET_KEY en .env');
        }
        const payment = this.repo.create({ ...dto, method: payment_entity_1.PaymentMethod.STRIPE });
        const saved = await this.repo.save(payment);
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                    price_data: {
                        currency: 'cop',
                        product_data: { name: dto.description || 'Pago Servimos Norte' },
                        unit_amount: Math.round(dto.amount * 100),
                    },
                    quantity: 1,
                }],
            mode: 'payment',
            success_url: `${this.config.get('FRONTEND_URL')}/pago/exito?payment=${saved.id}`,
            cancel_url: `${this.config.get('FRONTEND_URL')}/pago/cancelado`,
            metadata: { paymentId: saved.id },
        });
        saved.transactionId = session.id;
        await this.repo.save(saved);
        return { url: session.url, paymentId: saved.id };
    }
    async confirmStripePayment(sessionId) {
        const payment = await this.repo.findOne({ where: { transactionId: sessionId } });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        payment.status = payment_entity_1.PaymentStatusEnum.COMPLETED;
        await this.repo.save(payment);
        await this.updateRelatedStatus(payment);
        return payment;
    }
    async updateRelatedStatus(payment) {
        if (payment.repairId) {
            const repair = await this.repairsService.findOne(payment.repairId);
            const totalPaid = await this.getTotalPaidForRepair(payment.repairId);
            if (totalPaid >= repair.cost) {
                await this.repairsService.updatePaymentStatus(payment.repairId, repair_entity_1.PaymentStatus.PAID);
            }
            else if (totalPaid > 0) {
                await this.repairsService.updatePaymentStatus(payment.repairId, repair_entity_1.PaymentStatus.PARTIAL);
            }
        }
        if (payment.orderId) {
            await this.ordersService.updateStatus(payment.orderId, order_entity_1.OrderStatus.PAID);
        }
    }
    async getTotalPaidForRepair(repairId) {
        const result = await this.repo
            .createQueryBuilder('payment')
            .select('SUM(payment.amount)', 'total')
            .where('payment.repairId = :repairId', { repairId })
            .andWhere('payment.status = :status', { status: payment_entity_1.PaymentStatusEnum.COMPLETED })
            .getRawOne();
        return parseFloat(result.total) || 0;
    }
    async findAll() {
        return this.repo.find({
            relations: ['repair', 'order'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const payment = await this.repo.findOne({
            where: { id },
            relations: ['repair', 'order'],
        });
        if (!payment)
            throw new common_1.NotFoundException('Pago no encontrado');
        return payment;
    }
    async getRevenueByPeriod(startDate, endDate) {
        const payments = await this.repo.find({
            where: {
                status: payment_entity_1.PaymentStatusEnum.COMPLETED,
                createdAt: (0, typeorm_2.Between)(startDate, endDate),
            },
            relations: ['repair', 'order'],
        });
        let repairIncome = 0;
        let productSales = 0;
        payments.forEach((p) => {
            if (p.repairId)
                repairIncome += Number(p.amount);
            if (p.orderId)
                productSales += Number(p.amount);
        });
        return {
            totalRevenue: repairIncome + productSales,
            repairIncome,
            productSales,
            totalPayments: payments.length,
        };
    }
    async updateStatus(id, status) {
        const payment = await this.findOne(id);
        payment.status = status;
        const saved = await this.repo.save(payment);
        if (status === payment_entity_1.PaymentStatusEnum.COMPLETED) {
            await this.updateRelatedStatus(saved);
        }
        return saved;
    }
    async getPendingPayments() {
        return this.repo.find({
            where: { status: payment_entity_1.PaymentStatusEnum.PENDING },
            relations: ['repair', 'order'],
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        repairs_service_1.RepairsService,
        orders_service_1.OrdersService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map