# 🔒 GymRat+ (Privado)

> **PROYECTO PRIVADO Y CONFIDENCIAL**
> Este código fuente es propiedad exclusiva de GymRat+. Su distribución, copia o uso no autorizado está estrictamente prohibido.

Plataforma integral SaaS para la gestión de fitness, nutrición y entrenamiento inteligente.

## 📋 Descripción General

GymRat+ es una aplicación web progresiva (PWA) diseñada para conectar instructores con estudiantes, permitiendo la gestión de planes de entrenamiento, nutrición y seguimiento de progreso en tiempo real.

### Módulos Principales
- **🏋️ Gestión de Entrenamientos**: Rutinas personalizadas, librerías de ejercicios y seguimiento de sesiones.
- **🍽️ Nutrición Avanzada**: Base de datos de alimentos, cálculo de macros y planes nutricionales.
- **busts_in_silhouette: Sistema de Instructores**: Panel administrativo para entrenadores, gestión de estudiantes y facturación.
- **📊 Analítica**: Dashboards de progreso, composición corporal y cumplimiento de objetivos.
- **🤖 Rocco AI**: Asistente virtual integrado para dudas de fitness y nutrición.
- **💳 Pagos y Suscripciones**: Integración con Mercado Pago para membresías PRO e Instructor.

## 🛠️ Stack Tecnológico

**Core:**
- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Componentes:** shadcn/ui

**Backend & Datos:**
- **BD:** PostgreSQL (Neon/Vercel Postgres)
- **ORM:** Prisma
- **Auth:** NextAuth.js (v5)
- **Cache:** Redis (Upstash)
- **Almacenamiento:** Vercel Blob

**Servicios:**
- **Emails:** Resend
- **Pagos:** Mercado Pago API
- **AI:** Vercel AI SDK

## 🚀 Configuración del Entorno de Desarrollo

### 1. Clonar y Preparar
```bash
git clone <url-del-repo-privado>
cd gymratplus
npm install
```

### 2. Variables de Entorno
Crea un archivo `.env.local` basado en `.env.example`. Variables críticas requeridas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `NEXTAUTH_SECRET` | Llave para encriptación de sesiones |
| `AUTH_EMAIL` | Email del administrador principal |
| `RESEND_API_KEY` | API Key para envío de emails |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para validar Webhooks de pagos |

### 3. Base de Datos
```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar esquema con BD (Development)
npx prisma db push
```

### 4. Ejecutar
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

## � Scripts del Proyecto

- `npm run dev`: Inicia servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run lint`: Verifica calidad de código.
- `npx prisma studio`: Panel visual para la base de datos.
- `npx ultracite fix`: Formateo y corrección automática de código.

## 🔒 Seguridad y Accesos

- **Admin Panel**: Accesible en `/admin`. Requiere que el email del usuario logueado coincida con `AUTH_EMAIL`.
- **Webhooks**: Los webhooks de Mercado Pago deben apuntar a `https://<dominio>/api/payment/webhook`.

## 🤝 Flujo de Trabajo

1. Mantener la rama `main` siempre estable y desplegable.
2. Desarrollar nuevas características en ramas `feature/nombre-feature`.
3. Realizar Pull Requests para revisión de código antes de integrar.

## 📄 Licencia

© 2024 GymRat+. Todos los derechos reservados.
El código fuente no puede ser utilizado, modificado ni distribuido sin autorización explícita de los propietarios.
