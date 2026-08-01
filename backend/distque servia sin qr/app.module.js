"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./auth/auth.module");
const customers_module_1 = require("./customers/customers.module");
const repairs_module_1 = require("./repairs/repairs.module");
const products_module_1 = require("./products/products.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const accounting_module_1 = require("./accounting/accounting.module");
const whatsapp_module_1 = require("./whatsapp/whatsapp.module");
const chatbot_module_1 = require("./chatbot/chatbot.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const databaseUrl = configService.get('DATABASE_URL');
                    const dbHost = configService.get('DB_HOST');
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            autoLoadEntities: true,
                            synchronize: true,
                            ssl: { rejectUnauthorized: false },
                            extra: { family: 4 },
                        };
                    }
                    if (dbHost) {
                        return {
                            type: 'postgres',
                            host: dbHost,
                            port: configService.get('DB_PORT') || 5432,
                            username: configService.get('DB_USERNAME') || 'postgres',
                            password: configService.get('DB_PASSWORD') || '',
                            database: configService.get('DB_NAME') || 'postgres',
                            autoLoadEntities: true,
                            synchronize: true,
                            ssl: { rejectUnauthorized: false },
                            extra: { family: 4 },
                        };
                    }
                    return {
                        type: 'sqlite',
                        database: 'db.sqlite',
                        autoLoadEntities: true,
                        synchronize: true,
                    };
                },
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            auth_module_1.AuthModule,
            customers_module_1.CustomersModule,
            repairs_module_1.RepairsModule,
            products_module_1.ProductsModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            accounting_module_1.AccountingModule,
            whatsapp_module_1.WhatsappModule,
            chatbot_module_1.ChatbotModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map