# 🏋️ GymRat+ - Plataforma de Fitness y Nutrición

Una aplicación web completa para gestionar entrenamientos, nutrición y seguimiento de progreso físico, construida con Next.js 15, TypeScript, Prisma y PostgreSQL.

## ✨ Características Principales

### 🏋️ Entrenamientos

- **Rutinas Personalizadas**: Crea y gestiona rutinas de entrenamiento adaptadas a tus objetivos
- **Seguimiento de Sesiones**: Registra tus entrenamientos con detalles de series, repeticiones y peso
- **Historial Completo**: Visualiza tu progreso a lo largo del tiempo
- **Rachas de Entrenamiento**: Mantén la motivación con seguimiento de días consecutivos
- **Sistema de Instructores**: Los entrenadores pueden asignar rutinas a sus estudiantes

### 🍽️ Nutrición

- **Registro de Comidas**: Lleva un control detallado de lo que consumes
- **Cálculo de Macros**: Seguimiento automático de calorías, proteínas, carbohidratos y grasas
- **Recomendaciones Inteligentes**: Sugerencias de alimentos basadas en tus objetivos
- **Planes de Comida**: Crea y sigue planes nutricionales personalizados
- **Base de Datos de Alimentos**: Amplia base de datos con información nutricional

### 📊 Progreso y Estadísticas

- **Gráficos Interactivos**: Visualiza tu evolución con gráficos de peso, grasa corporal y masa muscular
- **Objetivos Personalizados**: Establece y sigue objetivos específicos
- **Métricas Detalladas**: Análisis completo de tu progreso físico

### 🔔 Notificaciones

- **Recordatorios Inteligentes**: Notificaciones para entrenamientos, comidas y objetivos
- **Alertas de Progreso**: Avisos cuando alcanzas tus metas
- **Sistema de Notificaciones en Tiempo Real**: Actualizaciones instantáneas

## 🚀 Tecnologías

### Frontend

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **shadcn/ui** - Componentes UI modernos
- **Framer Motion** - Animaciones fluidas
- **Recharts** - Gráficos interactivos
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas

### Backend

- **Next.js API Routes** - Endpoints RESTful
- **Prisma** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js** - Autenticación
- **Redis/Upstash** - Caché y notificaciones en tiempo real

### DevOps

- **Vercel** - Hosting y despliegue
- **TypeScript** - Type checking
- **ESLint** - Linting de código

## 📋 Requisitos Previos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn
- Cuenta de Vercel (opcional, para despliegue)

## 🛠️ Instalación

1. **Clonar el repositorio**

```bash
git clone https://github.com/tu-usuario/gymratplus.git
cd gymratplus
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# ============================================
# Base de Datos
# ============================================
# URL de conexión a PostgreSQL para desarrollo
DATABASE_URL_DEV="postgresql://usuario:password@localhost:5432/gymratplus"

# URL de conexión a PostgreSQL para producción
DATABASE_URL_PRO="postgresql://usuario:password@host:5432/gymratplus"

# ============================================
# Autenticación (NextAuth.js)
# ============================================
# Secret usado para encriptar tokens JWT (genera uno con: openssl rand -base64 32)
NEXTAUTH_SECRET="tu-secret-key-aqui-genera-uno-seguro"

# URL base de tu aplicación
# Desarrollo: http://localhost:3000
# Producción: https://tu-dominio.com
NEXTAUTH_URL="http://localhost:3000"

# ============================================
# OAuth - Google (Opcional)
# ============================================
# Para habilitar login con Google, crea un proyecto en:
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID="tu-google-client-id"
GOOGLE_CLIENT_SECRET="tu-google-client-secret"

# ============================================
# Redis / Upstash (Notificaciones en tiempo real)
# ============================================
# Obtén estas credenciales desde: https://console.upstash.com/
UPSTASH_REDIS_REST_URL="https://tu-instancia.upstash.io"
UPSTASH_REDIS_REST_TOKEN="tu-token-de-upstash"

# ============================================
# Vercel Blob Storage (Almacenamiento de archivos)
# ============================================
# Para subir imágenes y archivos en los chats
# Obtén el token desde: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_token_aqui"

# ============================================
# Resend (Envío de Emails)
# ============================================
# Para enviar emails de recuperación de contraseña y notificaciones
# 1. Crea una cuenta en: https://resend.com
# 2. Obtén tu API Key desde: https://resend.com/api-keys
# 3. (Opcional) Verifica tu dominio para mejor deliverability
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
# Email desde el cual se enviarán los emails
# SIN DOMINIO: No configures esta variable, se usará "onboarding@resend.dev" automáticamente
# CON DOMINIO: "GymRat+ <no-reply@gymratplus.com>" (debe estar verificado en Resend)
# RESEND_FROM_EMAIL="GymRat+ <no-reply@gymratplus.com>"

# ============================================
# ============================================
# Twilio (Verificación por SMS)
# ============================================
# Para verificación de teléfono por SMS
# 1. Crea una cuenta en: https://www.twilio.com/try-twilio
# 2. Obtén tu Account SID y Auth Token desde: https://console.twilio.com/
# 3. Compra un número de teléfono o usa el de prueba
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_PHONE_NUMBER="+1234567890"

# ============================================
# Entorno
# ============================================
# Automático: 'development' o 'production'
# No es necesario configurarlo manualmente
NODE_ENV="development"
```

### Variables Requeridas vs Opcionales

**Requeridas (la aplicación no funcionará sin estas):**

- `DATABASE_URL_DEV` o `DATABASE_URL_PRO`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

**Opcionales (funcionalidades específicas):**

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Solo si quieres login con Google
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` - Solo si quieres notificaciones en tiempo real
- `BLOB_READ_WRITE_TOKEN` - Solo si quieres subir archivos en los chats
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` - Solo si quieres enviar emails de verificación
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` - Solo si quieres verificación por SMS

### Generar NEXTAUTH_SECRET

Para generar un `NEXTAUTH_SECRET` seguro, ejecuta:

```bash
openssl rand -base64 32
```

O usa un generador online: https://generate-secret.vercel.app/32

4. **Configurar la base de datos**

```bash
# Generar cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar con datos iniciales
npm run seed
```

5. **Iniciar el servidor de desarrollo**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
gymratplus/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones de Prisma
├── public/                    # Archivos estáticos
├── src/
│   ├── app/                   # App Router de Next.js
│   │   ├── api/              # API Routes
│   │   ├── auth/             # Páginas de autenticación
│   │   ├── dashboard/        # Páginas del dashboard
│   │   └── onboarding/       # Páginas de onboarding
│   ├── components/           # Componentes React
│   │   ├── ui/               # Componentes UI base
│   │   ├── dashboard/        # Componentes del dashboard
│   │   ├── nutrition/        # Componentes de nutrición
│   │   └── workout/          # Componentes de entrenamiento
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Utilidades y helpers
│   │   ├── auth/             # Configuración de autenticación
│   │   ├── database/         # Configuración de BD
│   │   ├── notifications/    # Sistema de notificaciones
│   │   └── workout/          # Utilidades de entrenamiento
│   ├── providers/            # Context providers
│   └── types/                # Tipos TypeScript
└── scripts/                  # Scripts de utilidad
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo con Turbopack

# Producción
npm run build            # Construye la aplicación para producción
npm run start            # Inicia servidor de producción

# Base de datos
npx prisma studio        # Abre Prisma Studio (GUI para BD)
npx prisma migrate dev   # Crea y aplica migraciones
npx prisma generate      # Genera cliente de Prisma

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run type-check       # Verifica tipos TypeScript
npm run format           # Formatea código con Prettier

# Utilidades
npm run check-routes     # Verifica rutas de la API
```

## 🎨 Características de Diseño

- **Diseño Responsive**: Optimizado para móviles, tablets y desktop
- **Modo Oscuro**: Soporte completo para tema claro/oscuro
- **Animaciones Suaves**: Transiciones fluidas con Framer Motion
- **UI Moderna**: Componentes basados en shadcn/ui
- **Accesibilidad**: Cumple con estándares WCAG

## 🔐 Autenticación

La aplicación utiliza NextAuth.js con múltiples proveedores:

- Autenticación por email/contraseña
- OAuth (Google, GitHub, etc.)

## 📊 Base de Datos

El esquema de Prisma incluye modelos para:

- Usuarios y perfiles
- Entrenamientos y sesiones
- Alimentos y recetas
- Registros de comidas
- Objetivos y progreso
- Notificaciones
- Sistema de instructores/estudiantes

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y desplegará

### Otros proveedores

La aplicación puede desplegarse en cualquier plataforma que soporte Next.js:

- Railway
- Render
- AWS
- DigitalOcean

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - _Desarrollo inicial_ - [TuGitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- shadcn por los componentes UI
- Vercel por el hosting
- La comunidad de Next.js

## 📧 Configuración de Resend (Emails)

### Configuración Básica

1. **Crear cuenta en Resend**
   - Ve a [https://resend.com](https://resend.com)
   - Crea una cuenta (gratis, sin tarjeta)

2. **Obtener API Key**
   - Ve a [https://resend.com/api-keys](https://resend.com/api-keys)
   - Crea una API Key
   - Cópiala

3. **Configurar `.env.local`**

   **Opción A: Sin Dominio (Recomendado para empezar)**

   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
   ```

   El sistema usará automáticamente `onboarding@resend.dev` como remitente.

   **Opción B: Con Dominio Propio**

   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxx"
   RESEND_FROM_EMAIL="GymRat+ <no-reply@gymratplus.com>"
   ```

   El dominio debe estar verificado en [Resend Domains](https://resend.com/domains).

### Free Tier de Resend

- ✅ **3,000 emails/mes** gratis
- ✅ **100 emails/día** gratis
- ✅ Sin tarjeta de crédito requerida

### Troubleshooting

- **Error: "Resend no está configurado"**: Asegúrate de que `RESEND_API_KEY` esté en tu `.env.local`
- **Emails no llegan**: Revisa la consola del servidor, verifica la API Key, y revisa la carpeta de spam
- **Error de dominio**: No configures `RESEND_FROM_EMAIL` si no tienes dominio verificado

## 🔄 Recuperación de Contraseña

El sistema incluye recuperación de contraseña con código de 6 dígitos (2FA):

- Verificación de email antes de enviar
- Código de 6 dígitos enviado por email
- Expiración de 10 minutos
- Máximo 5 intentos fallidos
- Templates de email con React Email y Tailwind

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

Hecho con ❤️ usando Next.js y TypeScript
