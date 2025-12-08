# MÓDULO 1: Configuración Inicial del Proyecto

## 🎯 Objetivo

Preparar el entorno de desarrollo completo para Laravel 11 y Next.js 14.

---

## 📋 Tareas

### **1.1 Instalación de Laravel 11**

- [ ] Instalar Laravel via Composer:

  ```bash
  composer create-project laravel/laravel mmu-backend
  cd mmu-backend
  ```

- [ ] Instalar dependencias principales:

  ```bash
  composer require laravel/sanctum
  composer require spatie/laravel-permission
  composer require intervention/image
  composer require google/generative-ai-php
  ```

- [ ] Instalar dependencias de desarrollo:
  ```bash
  composer require --dev laravel/pint
  composer require --dev barryvdh/laravel-debugbar
  composer require --dev fakerphp/faker
  ```

### **1.2 Configuración de Laravel**

- [ ] Configurar archivo `.env`:

  ```env
  APP_NAME="MMU UNIMAR"
  APP_ENV=local
  APP_DEBUG=true
  APP_URL=http://localhost:8000

  DB_CONNECTION=mysql
  DB_HOST=127.0.0.1
  DB_PORT=3306
  DB_DATABASE=mmu
  DB_USERNAME=root
  DB_PASSWORD=

  # Gemini API
  GEMINI_API_KEY=your_api_key_here
  GEMINI_MODEL=gemini-pro

  # CORS
  SANCTUM_STATEFUL_DOMAINS=localhost:3000
  SESSION_DOMAIN=localhost
  ```

- [ ] Crear base de datos MySQL:

  ```sql
  CREATE DATABASE mmu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  ```

- [ ] Configurar CORS en `config/cors.php`:

  ```php
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  'allowed_origins' => ['http://localhost:3000'],
  'allowed_methods' => ['*'],
  'allowed_headers' => ['*'],
  'supports_credentials' => true,
  ```

- [ ] Publicar configuraciones:
  ```bash
  php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
  php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
  ```

### **1.3 Instalación de Next.js 14**

- [ ] Crear proyecto Next.js:

  ```bash
  npx create-next-app@latest mmu-frontend
  # Seleccionar:
  # ✅ TypeScript
  # ✅ ESLint
  # ✅ Tailwind CSS
  # ✅ App Router
  # ✅ Turbopack (opcional)
  ```

- [ ] Instalar dependencias core:

  ```bash
  cd mmu-frontend
  npm install axios
  npm install @tanstack/react-query
  npm install react-hook-form zod @hookform/resolvers
  ```

- [ ] Instalar Quill.js y extensiones:

  ```bash
  npm install react-quill quill
  npm install quill-image-resize-module-react
  npm install quill-image-uploader
  ```

- [ ] Instalar UI y utilidades:

  ```bash
  npm install lucide-react
  npm install react-hot-toast
  npm install @headlessui/react
  npm install framer-motion
  npm install clsx tailwind-merge
  ```

- [ ] Instalar librerías para dashboard:
  ```bash
  npm install recharts
  npm install date-fns
  ```

### **1.4 Configuración de Next.js**

- [ ] Configurar `next.config.js`:

  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    images: {
      domains: ["localhost", "api.mmu.unimar.edu.ve"],
      formats: ["image/avif", "image/webp"],
    },
    env: {
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    },
  };

  module.exports = nextConfig;
  ```

- [ ] Crear archivo `.env.local`:

  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000/api
  ```

- [ ] Configurar TailwindCSS en `tailwind.config.ts`:

  ```typescript
  import type { Config } from "tailwindcss";

  const config: Config = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",
      "./components/**/*.{js,ts,jsx,tsx,mdx}",
      "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
      extend: {
        colors: {
          unimar: {
            blue: "#0b3d91",
            lightblue: "#d0e0fc",
          },
        },
      },
    },
    plugins: [],
  };

  export default config;
  ```

### **1.5 Estructura de Carpetas**

- [ ] Crear estructura en Laravel:

  ```
  mmu-backend/
  ├── app/
  │   ├── Http/
  │   │   ├── Controllers/
  │   │   │   ├── AuthController.php
  │   │   │   ├── PublicationController.php
  │   │   │   ├── BlockController.php
  │   │   │   ├── AIController.php
  │   │   │   └── AnalyticsController.php
  │   │   ├── Requests/
  │   │   │   ├── StorePublicationRequest.php
  │   │   │   └── UpdatePublicationRequest.php
  │   │   └── Resources/
  │   │       ├── PublicationResource.php
  │   │       └── UserResource.php
  │   ├── Models/
  │   │   ├── User.php
  │   │   ├── Publication.php
  │   │   ├── PublicationBlock.php
  │   │   ├── PublicationType.php
  │   │   └── AnalyticsEvent.php
  │   └── Services/
  │       ├── GeminiService.php
  │       ├── BlockService.php
  │       └── AnalyticsService.php
  ├── database/
  │   ├── migrations/
  │   └── seeders/
  └── routes/
      └── api.php
  ```

- [ ] Crear estructura en Next.js:
  ```
  mmu-frontend/
  ├── app/
  │   ├── (public)/
  │   │   ├── page.tsx
  │   │   ├── publicaciones/
  │   │   │   ├── page.tsx
  │   │   │   └── [slug]/page.tsx
  │   │   └── layout.tsx
  │   ├── (admin)/
  │   │   ├── dashboard/page.tsx
  │   │   ├── publicaciones/
  │   │   │   ├── page.tsx
  │   │   │   ├── nueva/page.tsx
  │   │   │   └── [id]/editar/page.tsx
  │   │   └── layout.tsx
  │   └── api/
  ├── components/
  │   ├── editor/
  │   │   ├── QuillEditor.tsx
  │   │   ├── QuillToolbar.tsx
  │   │   ├── AIAssistantPanel.tsx
  │   │   └── BlockManager.tsx
  │   ├── publications/
  │   ├── dashboard/
  │   └── ui/
  └── lib/
      ├── api.ts
      ├── gemini.ts
      └── quill-config.ts
  ```

### **1.6 Control de Versiones**

- [ ] Inicializar Git en ambos proyectos:

  ```bash
  # Backend
  cd mmu-backend
  git init

  # Frontend
  cd mmu-frontend
  git init
  ```

- [ ] Crear `.gitignore` para Laravel (ya viene por defecto)

- [ ] Crear `.gitignore` para Next.js (ya viene por defecto)

- [ ] Crear repositorio remoto (GitHub/GitLab)

- [ ] Crear branches:
  ```bash
  git checkout -b develop
  git checkout -b feature/setup
  ```

---

## ✅ Checklist de Finalización

- [ ] Laravel 11 instalado y funcionando
- [ ] Next.js 14 instalado y funcionando
- [ ] Todas las dependencias instaladas
- [ ] Archivos `.env` configurados
- [ ] Base de datos MySQL creada
- [ ] CORS configurado correctamente
- [ ] Estructura de carpetas creada
- [ ] Git inicializado

---

## 🔧 Comandos de Verificación

```bash
# Verificar Laravel
cd mmu-backend
php artisan --version  # Debe mostrar Laravel 11.x

# Verificar Next.js
cd mmu-frontend
npm run dev  # Debe iniciar en http://localhost:3000

# Verificar conexión a BD
cd mmu-backend
php artisan migrate:status
```

---

## ⏱️ Tiempo Estimado

**2-3 días** (incluye instalación, configuración y familiarización)
