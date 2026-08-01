import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const authService = app.get(AuthService);

    console.log('🌱 Seeding database...');
    await authService.seedAdmin();
    console.log('✅ Seeding complete!');

    await app.close();
}

seed().catch(console.error);
