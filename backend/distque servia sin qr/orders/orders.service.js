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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const order_item_entity_1 = require("./entities/order-item.entity");
const products_service_1 = require("../products/products.service");
const customers_service_1 = require("../customers/customers.service");
let OrdersService = class OrdersService {
    constructor(orderRepo, itemRepo, productsService, customersService) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.productsService = productsService;
        this.customersService = customersService;
    }
    async create(dto) {
        let total = 0;
        const items = [];
        for (const item of dto.items) {
            const product = await this.productsService.findOne(item.productId);
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}`);
            }
            total += product.price * item.quantity;
            items.push({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: product.price,
            });
        }
        let customerId = dto.customerId;
        if (!customerId && dto.guestPhone && dto.guestName) {
            let customer = await this.customersService.findByPhone(dto.guestPhone);
            if (!customer) {
                customer = await this.customersService.create({
                    fullName: dto.guestName,
                    phone: dto.guestPhone,
                    email: dto.guestEmail || '',
                    address: dto.shippingAddress || '',
                });
            }
            customerId = customer.id;
        }
        const order = this.orderRepo.create({
            customerId,
            guestName: dto.guestName,
            guestPhone: dto.guestPhone,
            guestEmail: dto.guestEmail,
            shippingAddress: dto.shippingAddress,
            total,
            items: items,
        });
        const savedOrder = await this.orderRepo.save(order);
        for (const item of dto.items) {
            await this.productsService.updateStock(item.productId, -item.quantity);
        }
        return this.findOne(savedOrder.id);
    }
    async findAll() {
        return this.orderRepo.find({
            relations: ['customer', 'items', 'items.product', 'payments'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const order = await this.orderRepo.findOne({
            where: { id },
            relations: ['customer', 'items', 'items.product', 'payments'],
        });
        if (!order)
            throw new common_1.NotFoundException('Orden no encontrada');
        return order;
    }
    async updateStatus(id, status) {
        await this.findOne(id);
        await this.orderRepo.update(id, { status });
        return this.findOne(id);
    }
    async remove(id) {
        await this.findOne(id);
        await this.orderRepo.delete(id);
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        products_service_1.ProductsService,
        customers_service_1.CustomersService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map