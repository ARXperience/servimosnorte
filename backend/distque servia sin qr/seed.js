"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const auth_service_1 = require("./auth/auth.service");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const authService = app.get(auth_service_1.AuthService);
    console.log('🌱 Seeding database...');
    await authService.seedAdmin();
    console.log('✅ Seeding complete!');
    await app.close();
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map