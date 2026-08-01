import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { RepairsModule } from './repairs/repairs.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { AccountingModule } from './accounting/accounting.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { TrashModule } from './trash/trash.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const databaseUrl = configService.get<string>('DATABASE_URL');
                const dbHost = configService.get<string>('DB_HOST');
                if (databaseUrl) {
                    // Production: PostgreSQL via connection string
                    return {
                        type: 'postgres' as const,
                        url: databaseUrl,
                        autoLoadEntities: true,
                        synchronize: true,
                        ssl: { rejectUnauthorized: false },
                        extra: { family: 4 },
                    };
                }
                if (dbHost) {
                    // Production: PostgreSQL via individual vars
                    return {
                        type: 'postgres' as const,
                        host: dbHost,
                        port: configService.get<number>('DB_PORT') || 5432,
                        username: configService.get<string>('DB_USERNAME') || 'postgres',
                        password: configService.get<string>('DB_PASSWORD') || '',
                        database: configService.get<string>('DB_NAME') || 'postgres',
                        autoLoadEntities: true,
                        synchronize: true,
                        ssl: { rejectUnauthorized: false },
                        extra: { family: 4 },
                    };
                }
                // Local development: SQLite
                return {
                    type: 'sqlite' as const,
                    database: 'db.sqlite',
                    autoLoadEntities: true,
                    synchronize: true,
                };
            },
        }),
        AuthModule,
        CustomersModule,
        RepairsModule,
        ProductsModule,
        OrdersModule,
        PaymentsModule,
        AccountingModule,
        WhatsappModule,
        ChatbotModule,
        TrashModule,
        EmailModule,
        NotificationsModule,
    ],
})
export class AppModule { }
