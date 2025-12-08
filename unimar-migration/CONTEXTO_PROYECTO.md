# 📘 DOCUMENTO MAESTRO - Proyecto Migración MMU UNIMAR

## Para Conversación Futura

---

## 🎯 CONTEXTO DEL PROYECTO

### **Nombre del Proyecto**

Sistema Multimedia UNIMAR (MMU) - Migración Completa

### **Objetivo General**

Migrar el sistema actual de gestión de contenido multimedia de **PHP puro** a una arquitectura moderna y escalable:

- **Backend**: Laravel 11 (API REST)
- **Frontend**: Next.js 14 (App Router)
- **Base de Datos**: MySQL con estructura mejorada
- **IA**: Gemini API (Google AI) para asistencia en creación de contenido
- **Analytics**: Dashboard con estadísticas y métricas

### **Universidad**

Universidad de Margarita (UNIMAR)

### **Desarrollador**

Manuel Casique

---

## ✅ ESTADO ACTUAL DEL PROYECTO

### **Módulo 1: COMPLETADO ✅**

**Ubicación del proyecto:**
Directorio actual: `unimar-migration/`

**Estructura actual:**

```
unimar-migration/
├── backend/          # Laravel 11
│   ├── .env         # Configurado con MySQL + Gemini API
│   ├── config/
│   │   └── services.php  # Gemini configurado
│   └── routes/
│       └── web.php      # Ruta /verificar creada
│
└── frontend/         # Next.js 14
    ├── tailwind.config.ts  # Colores UNIMAR configurados
    ├── app/
    │   ├── globals.css     # Montserrat + estilos UNIMAR
    │   └── page.tsx        # Página de prueba
    └── package.json
```

**Instalaciones completadas:**

- ✅ Laravel 11.47.0
- ✅ Laravel Sanctum v4.2.1
- ✅ Spatie Laravel Permission v6.23.0
- ✅ Intervention Image v3.11
- ✅ Google Gemini PHP Client v2.7
- ✅ Next.js 14 con TypeScript, Tailwind, App Router
- ✅ react-quill, axios, @tanstack/react-query, recharts, lucide-react

**Servidores:**

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`

---

## 🎨 IDENTIDAD GRÁFICA UNIMAR (MUY IMPORTANTE)

### **Colores Institucionales**

```css
/* SIEMPRE usar estos colores */
--unimar-primary: #0b3d91; /* Azul oscuro principal */
--unimar-light: #d0e0fc; /* Azul claro (fondos) */
--unimar-accent: #336699; /* Azul medio (enlaces) */
--unimar-gray: gray; /* Gris para cards */

/* Colores de estado */
--unimar-success: #28a745;
--unimar-warning: #ffc107;
--unimar-danger: #dc3545;
--unimar-info: #17a2b8;
```

### **Tipografía**

```css
font-family: "Montserrat", sans-serif;
/* Pesos disponibles: 200, 400, 600, 700 */
```

### **Efectos de Hover**

```css
.card:hover {
  filter: brightness(0.6);
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(11, 61, 145, 0.2);
  transition: all 0.3s ease;
}
```

### **Clases de Utilidad Creadas**

- `.btn-primary` - Botón con color primario UNIMAR
- `.card` - Tarjeta con efectos hover
- `.card-image` - Imagen con efecto brightness
- `.hover-text` - Texto que aparece en hover

---

## 🔑 DECISIONES TÉCNICAS FINALES

### **1. Next.js 14 (NO Vite + React)**

- **Razón**: SEO superior con SSR/SSG
- **Configuración**: App Router, TypeScript, Tailwind

### **2. Gemini API (NO OpenAI)**

- **Razón**: Tier gratuito hasta 1M tokens/mes
- **Modelo**: `gemini-pro`
- **SDK**: `google-gemini-php/client`

### **3. Quill.js (NO Tiptap)**

- **Razón**: Más maduro, fácil de personalizar
- **Uso**: Editor WYSIWYG para contenido

### **4. SIN Autocompletado en Tiempo Real**

- **Razón**: Ahorra tokens de Gemini
- **Alternativa**: Solo sugerencias manuales cuando usuario hace clic

### **5. Sistema de Bloques Flexibles**

- **Concepto**: Contenido en bloques ordenables
- **Tipos**: text, image, video, embed, divider
- **Orden**: Completamente variable (texto-imagen-texto-video-imagen)

---

## 📊 ARQUITECTURA DE BLOQUES (CONCEPTO CLAVE)

### **Tabla Principal: `publication_blocks`**

```sql
CREATE TABLE publication_blocks (
    id BIGINT PRIMARY KEY,
    publication_id BIGINT,  -- FK a publications
    type VARCHAR(50),        -- text, image, video, embed, divider
    content JSON,            -- Contenido flexible
    order INT,               -- Orden de aparición
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Estructura JSON por Tipo**

**Tipo: `text`** (contenido de Quill.js)

```json
{
  "html": "<p>Contenido con <strong>formato</strong></p>",
  "delta": {
    /* Delta de Quill.js */
  },
  "plain_text": "Contenido sin formato"
}
```

**Tipo: `image`**

```json
{
  "url": "/storage/uploads/image123.jpg",
  "caption": "Descripción de la imagen",
  "alt": "Texto alternativo",
  "width": 1200,
  "height": 800,
  "alignment": "center"
}
```

**Tipo: `video`**

```json
{
  "type": "upload",
  "url": "/storage/videos/video.mp4",
  "thumbnail": "/storage/thumbnails/thumb.jpg",
  "caption": "Descripción del video"
}
```

---

## 📋 PLAN DE MÓDULOS (7 MÓDULOS RESTANTES)

### **Módulo 1: Configuración Inicial** ✅ COMPLETADO

- Tiempo: 2-3 días
- Estado: 100% completado

### **Módulo 2: Base de Datos y Migraciones** ⏳ SIGUIENTE

- Tiempo: 4-6 días
- Tareas: 22
- **Archivos a crear:**
  - 7 migraciones Laravel
  - 3 seeders
  - 5 modelos Eloquent
  - 1 comando Artisan para migrar datos viejos

**Migraciones a crear:**

1. `create_users_table` (modificar existente)
2. `create_publication_types_table`
3. `create_publications_table`
4. `create_publication_blocks_table` ⭐ CLAVE
5. `create_publication_author_table` (pivot)
6. `create_publication_publication_type_table` (pivot)
7. `create_analytics_events_table`

### **Módulo 3: Backend Laravel + Gemini API**

- Tiempo: 7-9 días
- Tareas: 30
- **Archivos a crear:**
  - `app/Services/GeminiService.php` ⭐
  - `app/Http/Controllers/AIController.php`
  - `app/Http/Controllers/BlockController.php`
  - `app/Http/Controllers/PublicationController.php`
  - Rutas API en `routes/api.php`

### **Módulo 4: Autenticación y Autorización**

- Tiempo: 2-3 días
- Tareas: 12
- **Roles**: admin, editor, user

### **Módulo 5: Frontend Next.js + Quill.js**

- Tiempo: 10-14 días
- Tareas: 35
- **Componentes clave**: QuillEditor, AIAssistantPanel, BlockManager

### **Módulo 7: Dashboard y Analytics**

- Tiempo: 4-6 días
- Tareas: 18

### **Módulo 8: Testing y Deploy**

- Tiempo: 3-5 días
- Tareas: 15

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

### **1. Continuar con Módulo 2**

**Documento a leer:**
`./MODULO_2_Base_Datos_Migraciones.md` (En este directorio)

**Primera tarea:**
Crear migración `create_publication_types_table`

### **2. Archivos de Referencia**

Todos los documentos están en este directorio:

- `MODULO_2_Base_Datos_Migraciones.md` - Siguiente módulo
- `MODULO_3_Backend_Laravel_Gemini.md` - Backend + IA
- `MODULO_5_Frontend_NextJS_Quill.md` - Frontend + Editor
- `GUIA_TRABAJO.md` - Guía completa

---

## 📝 REGLAS IMPORTANTES PARA LA PRÓXIMA IA

### **1. Identidad Gráfica**

- SIEMPRE usar colores UNIMAR (#0b3d91, #d0e0fc, #336699)
- SIEMPRE usar fuente Montserrat

### **2. Sistema de Bloques**

- Contenido DEBE estar en bloques separados
- Orden DEBE ser flexible

### **3. IA con Gemini**

- NO implementar autocompletado en tiempo real -> Usar botones manuales

---

## 📊 PROGRESO GENERAL

```
Módulo 1: ████████████████████ 100% ✅
Módulo 2: ░░░░░░░░░░░░░░░░░░░░   0% ⏳ SIGUIENTE
...
```

**Tiempo estimado restante:** 30-45 días

---

## 🎯 RESUMEN PARA LA PRÓXIMA IA

**Estado actual:**

- Módulo 1 completado al 100%
- Laravel 11 y Next.js 14 instalados
- Identidad UNIMAR aplicada

**Próxima tarea:**

- Empezar Módulo 2
- Crear 7 migraciones

**Documentos a leer:**

1. Este documento `CONTEXTO_PROYECTO.md`
2. `MODULO_2_Base_Datos_Migraciones.md`
3. `GUIA_TRABAJO.md`

**¡Listo para continuar! 🚀**
