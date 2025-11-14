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

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/gymratplus"
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"
REDIS_URL="tu-redis-url"
UPSTASH_REDIS_REST_URL="tu-upstash-url"
UPSTASH_REDIS_REST_TOKEN="tu-upstash-token"
```

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

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en GitHub.

---

Hecho con ❤️ usando Next.js y TypeScript
