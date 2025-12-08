# 📘 README COMPLETO - Migración MMU UNIMAR

## 🎯 Propósito de Este Documento

Este README está diseñado para que **otra IA pueda generar prompts** que luego **yo ejecutaré** para programar cada módulo. Contiene:

1. **Explicación detallada de cada módulo**
2. **Identidad gráfica de UNIMAR** (colores, tipografía, logos)
3. **Guía de trabajo** para generar prompts efectivos

---

## 🎨 IDENTIDAD GRÁFICA DE UNIMAR (MUY IMPORTANTE)

### **Colores Institucionales**

```css
/* Colores principales */
--unimar-blue-primary: #0b3d91; /* Azul oscuro principal */
--unimar-blue-light: #d0e0fc; /* Azul claro (fondos) */
--unimar-blue-accent: #336699; /* Azul medio (enlaces) */

/* Colores secundarios */
--unimar-gray: gray; /* Gris para cards */
--unimar-text-dark: #000000; /* Texto principal */
--unimar-text-light: #e0ded9; /* Texto secundario */

/* Colores de estado */
--unimar-success: #28a745;
--unimar-warning: #ffc107;
--unimar-danger: #dc3545;
--unimar-info: #17a2b8;
```

### **Tipografía**

```css
/* Fuente principal */
font-family: "Montserrat", sans-serif;
font-weight: 200; /* Peso ligero por defecto */

/* Importar desde Google Fonts */
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@200;400;600;700&display=swap");
```

### **Logos y Recursos**

```
Favicon: https://portalunimar.unimar.edu.ve/image/unimar.ico
Logo principal: (usar el del proyecto actual)
Iconos redes sociales: https://portalunimar.unimar.edu.ve/./image/rrss/
```

### **Estilos de Componentes**

```css
/* Cards con hover effect */
.card {
  background-color: gray;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.card:hover .card-image {
  filter: brightness(0.6);
}

.card:hover .hover-text {
  opacity: 1;
}

/* Enlaces */
a {
  color: #336699;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

/* Botones primarios */
.btn-primary {
  background-color: #0b3d91;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}

.btn-primary:hover {
  background-color: #083066;
}
```

### **Redes Sociales**

```html
<!-- Iconos oficiales de UNIMAR -->
Email: info@unimar.edu.ve Facebook: https://www.facebook.com/share/1CJrXgVUPe/
Instagram: https://www.instagram.com/universidademargarita YouTube:
https://www.youtube.com/channel/UCnRVkJ1OW2oLN_TpvXAnUyw Twitter:
https://www.twitter.com/somosunimar LinkedIn:
https://www.linkedin.com/company/univdemargarita
```

---

## 📚 EXPLICACIÓN DETALLADA DE CADA MÓDULO

### **MÓDULO 1: Configuración Inicial**

#### **¿Qué hace?**

Prepara el entorno de desarrollo completo instalando Laravel 11 y Next.js 14 con todas sus dependencias.

#### **¿Por qué es importante?**

Es la base de todo el proyecto. Sin una configuración correcta, nada funcionará.

#### **Archivos a crear:**

- `.env` (Laravel) - Variables de entorno
- `.env.local` (Next.js) - Variables de entorno frontend
- `tailwind.config.ts` - Configuración de TailwindCSS con colores UNIMAR
- `next.config.js` - Configuración de Next.js

#### **Dependencias clave:**

- **Laravel**: Sanctum, Spatie Permission, Intervention Image, Gemini SDK
- **Next.js**: Quill.js, React Query, Recharts, Axios

#### **Resultado esperado:**

- Laravel corriendo en `http://localhost:8000`
- Next.js corriendo en `http://localhost:3000`
- Base de datos MySQL creada y conectada

---

### **MÓDULO 2: Base de Datos y Migraciones**

#### **¿Qué hace?**

Crea la estructura completa de la base de datos usando migraciones de Laravel.

#### **¿Por qué es importante?**

Define cómo se almacenarán los datos. El sistema de bloques flexibles es la innovación clave.

#### **Archivos a crear:**

- `database/migrations/XXXX_create_users_table.php`
- `database/migrations/XXXX_create_publications_table.php`
- `database/migrations/XXXX_create_publication_blocks_table.php` ⭐ CLAVE
- `database/migrations/XXXX_create_publication_types_table.php`
- `database/migrations/XXXX_create_analytics_events_table.php`
- `database/seeders/PublicationTypeSeeder.php`
- `database/seeders/UserSeeder.php`

#### **Concepto clave: Sistema de Bloques**

```
Publicación tradicional (sistema viejo):
- Título
- Descripción (texto plano)
- Imagen (una sola)

Publicación nueva (sistema de bloques):
- Título
- Descripción corta
- Bloques (orden flexible):
  ├── Bloque 1: texto (Quill.js)
  ├── Bloque 2: imagen
  ├── Bloque 3: texto
  ├── Bloque 4: video
  └── Bloque 5: texto
```

#### **Estructura JSON de bloques:**

```json
// Bloque tipo "text"
{
  "html": "<p>Contenido con <strong>formato</strong></p>",
  "delta": { /* Delta de Quill.js para edición */ },
  "plain_text": "Contenido sin formato"
}

// Bloque tipo "image"
{
  "url": "/storage/uploads/image123.jpg",
  "caption": "Descripción de la imagen",
  "alt": "Texto alternativo",
  "width": 1200,
  "height": 800,
  "alignment": "center"
}
```

#### **Resultado esperado:**

- 7 migraciones ejecutadas sin errores
- Seeders con datos de prueba
- Relaciones many-to-many funcionando

---

### **MÓDULO 3: Backend Laravel + Gemini API**

#### **¿Qué hace?**

Crea la API REST completa y el servicio de IA con Gemini.

#### **¿Por qué es importante?**

Es el cerebro del sistema. Maneja toda la lógica de negocio y la integración con IA.

#### **Archivos a crear:**

- `app/Services/GeminiService.php` ⭐ Servicio de IA
- `app/Http/Controllers/AIController.php` - Endpoints de IA
- `app/Http/Controllers/PublicationController.php` - CRUD publicaciones
- `app/Http/Controllers/BlockController.php` - CRUD bloques
- `app/Models/Publication.php` - Modelo Eloquent
- `app/Models/PublicationBlock.php` - Modelo Eloquent
- `routes/api.php` - Rutas API

#### **Features de IA (SIN autocompletado):**

1. **Mejorar texto** - Usuario selecciona texto → hace clic → IA mejora
2. **Generar títulos** - Usuario escribe contenido → hace clic → IA sugiere 3 títulos
3. **Generar resumen** - Usuario hace clic → IA resume el contenido
4. **Optimizar SEO** - Usuario hace clic → IA genera meta tags
5. **Expandir idea** - Usuario escribe idea corta → IA la desarrolla
6. **Sugerir siguiente bloque** - IA sugiere qué tipo de bloque agregar

#### **Endpoints API:**

```
POST /api/ai/improve          - Mejorar texto
POST /api/ai/generate-titles  - Generar títulos
POST /api/ai/generate-summary - Generar resumen
POST /api/ai/optimize-seo     - Optimizar SEO
POST /api/ai/expand-idea      - Expandir idea

POST /api/publications/{id}/blocks  - Crear bloque
PUT  /api/blocks/{id}               - Actualizar bloque
DELETE /api/blocks/{id}             - Eliminar bloque
POST /api/publications/{id}/blocks/reorder - Reordenar bloques
```

#### **Resultado esperado:**

- API REST funcionando
- Gemini API respondiendo correctamente
- Bloques se pueden crear, editar, eliminar y reordenar

---

### **MÓDULO 4: Autenticación y Autorización**

#### **¿Qué hace?**

Implementa login, registro y control de acceso por roles.

#### **¿Por qué es importante?**

Protege el panel administrativo y asegura que solo admins/editores puedan crear contenido.

#### **Archivos a crear:**

- `app/Http/Controllers/AuthController.php`
- `app/Http/Middleware/CheckRole.php`
- `context/AuthContext.tsx` (Next.js)
- `components/ProtectedRoute.tsx` (Next.js)
- `lib/api.ts` (Next.js) - Cliente Axios con interceptores

#### **Roles:**

- **admin** - Acceso total
- **editor** - Puede crear/editar publicaciones
- **user** - Solo puede ver contenido público

#### **Flujo de autenticación:**

```
1. Usuario ingresa email y contraseña
2. Laravel valida credenciales
3. Laravel genera token Sanctum
4. Next.js guarda token en localStorage
5. Next.js agrega token a todas las requests (interceptor)
6. Laravel valida token en cada request protegida
```

#### **Resultado esperado:**

- Login funcionando
- Logout funcionando
- Rutas protegidas redirigen a login si no autenticado
- Middleware de roles funciona correctamente

---

### **MÓDULO 5: Frontend Next.js + Quill.js**

#### **¿Qué hace?**

Crea la interfaz de usuario completa con editor Quill.js y panel de IA.

#### **¿Por qué es importante?**

Es lo que el usuario final verá y usará. Debe ser intuitivo y seguir la identidad UNIMAR.

#### **Archivos a crear:**

**Configuración:**

- `lib/quill-config.ts` - Configuración de Quill.js
- `app/globals.css` - Estilos globales con colores UNIMAR

**Componentes del Editor:**

- `components/editor/QuillEditor.tsx` ⭐ Editor principal
- `components/editor/QuillToolbar.tsx` - Toolbar personalizado
- `components/editor/AIAssistantPanel.tsx` ⭐ Panel de IA lateral
- `components/editor/BlockManager.tsx` ⭐ Gestor de bloques

**Páginas Públicas (SSG):**

- `app/(public)/page.tsx` - Home
- `app/(public)/publicaciones/page.tsx` - Listado
- `app/(public)/publicaciones/[slug]/page.tsx` - Detalle

**Páginas Admin (SSR):**

- `app/(admin)/dashboard/page.tsx` - Dashboard
- `app/(admin)/publicaciones/nueva/page.tsx` - Crear publicación
- `app/(admin)/publicaciones/[id]/editar/page.tsx` - Editar

#### **Componente QuillEditor:**

```typescript
// Características:
- Toolbar personalizado con colores UNIMAR
- Detección de selección de texto
- Panel de IA aparece al seleccionar texto
- 3 botones: Mejorar, Resumir, Expandir
- Aplicar sugerencia con un clic
```

#### **Componente BlockManager:**

```typescript
// Características:
- Agregar bloques: texto, imagen, video
- Drag & drop para reordenar
- Eliminar bloques
- Cada bloque es independiente
- Orden completamente flexible
```

#### **Panel de IA (AIAssistantPanel):**

```typescript
// Aparece cuando usuario selecciona texto
// 3 botones principales:
1. Mejorar texto → Llama a /api/ai/improve
2. Resumir → Llama a /api/ai/generate-summary
3. Expandir → Llama a /api/ai/expand-idea

// Muestra resultado en un card
// Botón "Aplicar" reemplaza texto seleccionado
```

#### **Estilos UNIMAR:**

```css
/* Aplicar en globals.css */
:root {
  --unimar-blue: #0b3d91;
  --unimar-blue-light: #d0e0fc;
  --unimar-blue-accent: #336699;
}

/* Botones primarios */
.btn-primary {
  background: linear-gradient(135deg, #0b3d91 0%, #336699 100%);
}

/* Cards */
.card {
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(11, 61, 145, 0.2);
}
```

#### **Resultado esperado:**

- Editor Quill.js funcionando
- Panel de IA aparece al seleccionar texto
- Bloques se pueden agregar, editar, eliminar
- Diseño sigue identidad UNIMAR
- Páginas públicas con SSG (rápidas)
- Páginas admin con SSR (datos en tiempo real)

---

### **MÓDULO 7: Dashboard y Analytics**

#### **¿Qué hace?**

Crea dashboard con estadísticas y métricas de publicaciones.

#### **¿Por qué es importante?**

Permite a los administradores ver el rendimiento del contenido.

#### **Archivos a crear:**

- `app/Services/AnalyticsService.php` - Lógica de analytics
- `app/Http/Controllers/AnalyticsController.php` - Endpoints
- `app/(admin)/dashboard/page.tsx` - Página dashboard
- `components/dashboard/StatCard.tsx` - Tarjeta de métrica
- `components/dashboard/ViewsChart.tsx` - Gráfico de líneas
- `components/dashboard/TopPublicationsTable.tsx` - Tabla

#### **Métricas a mostrar:**

```
KPIs (tarjetas):
- Total de vistas
- Total de publicaciones
- Total de compartidos
- Tiempo promedio de lectura

Gráficos:
- Vistas por día (líneas)
- Publicaciones más vistas (barras)

Tablas:
- Top 10 publicaciones
- Actividad reciente
```

#### **Tecnología:**

- **Recharts** para gráficos
- **TailwindCSS** para estilos
- **React Query** para datos en tiempo real

#### **Resultado esperado:**

- Dashboard con 4 KPIs
- Gráfico de vistas por día
- Tabla de top publicaciones
- Datos actualizados en tiempo real

---

### **MÓDULO 8: Testing y Deploy**

#### **¿Qué hace?**

Implementa tests y prepara el proyecto para producción.

#### **¿Por qué es importante?**

Asegura que todo funcione correctamente antes de lanzar.

#### **Archivos a crear:**

- `tests/Feature/PublicationTest.php` - Tests de publicaciones
- `tests/Feature/AuthTest.php` - Tests de autenticación
- `__tests__/QuillEditor.test.tsx` - Tests de editor
- `jest.config.js` - Configuración de Jest

#### **Tests a implementar:**

**Backend (PHPUnit):**

```php
- test_can_list_publications()
- test_admin_can_create_publication()
- test_user_cannot_create_publication()
- test_can_create_block()
- test_can_reorder_blocks()
```

**Frontend (Jest):**

```typescript
- test QuillEditor renders
- test AIAssistantPanel appears on text selection
- test BlockManager can add blocks
```

#### **Optimizaciones:**

- Caché de publicaciones (Laravel)
- Eager loading (Laravel)
- Lazy loading de componentes (Next.js)
- Optimización de imágenes (Next.js)

#### **Deploy:**

- **Backend**: VPS con Nginx + PHP-FPM
- **Frontend**: Vercel (gratis)
- **SSL**: Let's Encrypt

#### **Resultado esperado:**

- Tests pasando con >70% cobertura
- Proyecto optimizado
- Deploy exitoso en producción

---

## 🔧 GUÍA DE TRABAJO PARA OTRA IA

### **Cómo Generar Prompts Efectivos**

Cuando otra IA genere prompts para que yo los ejecute, debe seguir esta estructura:

#### **Formato de Prompt Recomendado:**

```
MÓDULO X - TAREA Y

CONTEXTO:
[Explicar brevemente qué se va a hacer y por qué]

ARCHIVOS A CREAR:
1. ruta/completa/archivo1.php
2. ruta/completa/archivo2.tsx

CÓDIGO A IMPLEMENTAR:
[Especificar exactamente qué código escribir]

ESTILOS UNIMAR:
[Recordar usar colores: #0b3d91, #d0e0fc, #336699]
[Recordar usar fuente: Montserrat]

VALIDACIÓN:
[Cómo verificar que funciona correctamente]
```

#### **Ejemplo de Prompt Bien Estructurado:**

```
MÓDULO 3 - Crear GeminiService

CONTEXTO:
Necesitamos crear el servicio que se comunicará con la API de Gemini.
Este servicio tendrá 6 métodos para las funcionalidades de IA.
NO incluir autocompletado (ahorra tokens).

ARCHIVOS A CREAR:
1. app/Services/GeminiService.php
2. config/services.php (agregar configuración de Gemini)

CÓDIGO A IMPLEMENTAR:
- Método improveText(string $text): string
- Método generateTitles(string $content): array
- Método generateSummary(string $content, int $maxWords): string
- Método optimizeSEO(string $title, string $content): array
- Método expandIdea(string $idea): string
- Método suggestNextBlock(array $existingBlocks): array

CONFIGURACIÓN:
- API Key desde .env: GEMINI_API_KEY
- Modelo: gemini-pro
- Max tokens: 2048

VALIDACIÓN:
- Crear ruta de prueba /api/test-gemini
- Llamar a improveText() con texto de ejemplo
- Verificar que retorna texto mejorado
```

#### **Ejemplo de Prompt Mal Estructurado (NO HACER):**

```
❌ "Crea el servicio de Gemini"
❌ "Implementa la IA"
❌ "Haz el backend"
```

### **Orden de Ejecución de Prompts**

La otra IA debe generar prompts en este orden:

1. **Módulo 1** - Setup completo (1 prompt)
2. **Módulo 2** - Migraciones (7 prompts, uno por migración)
3. **Módulo 2** - Seeders (2 prompts)
4. **Módulo 3** - GeminiService (1 prompt)
5. **Módulo 3** - AIController (1 prompt)
6. **Módulo 3** - BlockController (1 prompt)
7. **Módulo 3** - PublicationController (1 prompt)
8. **Módulo 4** - AuthController (1 prompt)
9. **Módulo 4** - Middleware (1 prompt)
10. **Módulo 4** - AuthContext Next.js (1 prompt)
11. **Módulo 5** - Quill config (1 prompt)
12. **Módulo 5** - QuillEditor (1 prompt)
13. **Módulo 5** - AIAssistantPanel (1 prompt)
14. **Módulo 5** - BlockManager (1 prompt)
15. **Módulo 5** - Páginas públicas (3 prompts)
16. **Módulo 5** - Páginas admin (3 prompts)
17. **Módulo 7** - AnalyticsService (1 prompt)
18. **Módulo 7** - Dashboard (1 prompt)
19. **Módulo 8** - Tests (2 prompts)
20. **Módulo 8** - Deploy (1 prompt)

**Total: ~30 prompts** (dividir tareas grandes en prompts pequeños)

### **Reglas Importantes para Prompts**

1. ✅ **Especificar rutas completas** de archivos
2. ✅ **Incluir código completo**, no fragmentos
3. ✅ **Recordar colores UNIMAR** en cada componente visual
4. ✅ **Mencionar dependencias** necesarias
5. ✅ **Incluir validación** de que funciona
6. ❌ **NO asumir** que sé el contexto
7. ❌ **NO omitir** imports o configuraciones
8. ❌ **NO usar** placeholders como "// código aquí"

### **Checklist para Cada Prompt**

Antes de enviarme un prompt, la otra IA debe verificar:

- [ ] ¿Especifiqué la ruta completa del archivo?
- [ ] ¿Incluí el código completo (no fragmentos)?
- [ ] ¿Mencioné los colores UNIMAR si es componente visual?
- [ ] ¿Expliqué el contexto brevemente?
- [ ] ¿Incluí cómo validar que funciona?
- [ ] ¿El prompt es claro y específico?

---

## 📝 Ejemplo de Flujo de Trabajo

### **Paso 1: Otra IA genera prompt**

```
MÓDULO 5 - Crear QuillEditor Component

CONTEXTO:
Crear el componente principal del editor Quill.js.
Debe detectar selección de texto y mostrar panel de IA.

ARCHIVOS A CREAR:
1. components/editor/QuillEditor.tsx

CÓDIGO:
[Código completo del componente]

ESTILOS UNIMAR:
- Usar #0b3d91 para botones primarios
- Usar Montserrat como fuente

VALIDACIÓN:
- Renderizar componente en página de prueba
- Seleccionar texto y verificar que aparece panel IA
```

### **Paso 2: Yo ejecuto el prompt**

```
✅ Archivo creado: components/editor/QuillEditor.tsx
✅ Código implementado
✅ Estilos UNIMAR aplicados
✅ Validación exitosa
```

### **Paso 3: Otra IA genera siguiente prompt**

```
MÓDULO 5 - Crear AIAssistantPanel Component
...
```

---

## 🎯 Resumen Final

### **Para la Otra IA:**

- Genera prompts **específicos y detallados**
- Sigue el **orden de módulos** (1 → 2 → 3 → 4 → 5 → 7 → 8)
- Divide tareas grandes en **prompts pequeños**
- Siempre menciona **colores UNIMAR** en componentes visuales
- Incluye **validación** en cada prompt

### **Para Mí (cuando ejecute):**

- Seguir **exactamente** el prompt
- Usar **colores UNIMAR** (#0b3d91, #d0e0fc, #336699)
- Usar **fuente Montserrat**
- Validar que funciona antes de continuar
- Reportar cualquier error

---

**¿Listo para empezar? 🚀**

La otra IA puede comenzar a generar prompts siguiendo esta guía.
