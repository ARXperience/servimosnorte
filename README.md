# Servimos Norte

Plataforma web completa para gestión de reparaciones, CRM, y tienda en línea.

## Estructura

```
servimosNorte/
├── backend/          # NestJS API (Puerto 3001)
├── frontend/         # Next.js 14 (Puerto 3000)
└── docker-compose.yml  # PostgreSQL
```

## Inicio Rápido

### 1. Base de Datos
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
npm install
npm run start:dev
```

### 3. Seed Admin
```bash
# Visitar en el navegador o usar curl:
POST http://localhost:3001/api/auth/seed
```
Credenciales: `admin@servimosnorte.com` / `Admin123!`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Acceder
- **Sitio Web**: http://localhost:3000
- **Admin CRM**: http://localhost:3000/admin/login
- **API Docs**: http://localhost:3001/api/docs

## Variables de Entorno

### Backend (.env)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_EXPIRATION`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `FRONTEND_URL`

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STRIPE_KEY`
