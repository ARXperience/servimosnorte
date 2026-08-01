import * as dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { getUploadsPath } from './uploads-path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const uploadsDir = getUploadsPath();
    mkdirSync(join(uploadsDir, 'products'), { recursive: true });

    // CORS
    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['https://servimosnorte.com', 'https://www.servimosnorte.com', 'http://localhost:3000'];
    // Chrome Private Network Access: necesario para desarrollo local (localhost:3000 → localhost:3001)
    app.use((req: any, res: any, next: any) => {
        res.header('Access-Control-Allow-Private-Network', 'true');
        next();
    });
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    // Serve uploaded files statically (BEFORE global prefix so it's /uploads, not /api/uploads)
    app.useStaticAssets(uploadsDir, {
        prefix: '/uploads/',
    });

    // Global prefix
    app.setGlobalPrefix('api');

    // Validation
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Servimos Norte API')
        .setDescription('API para gestión de reparaciones, clientes y tienda')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Servimos Norte API corriendo en puerto ${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();

