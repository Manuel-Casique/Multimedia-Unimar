# 🚀 GUÍA RÁPIDA DE INICIO - Para la Próxima IA

## ⚡ INICIO RÁPIDO (Lee esto primero)

### **1. Estado Actual**

- ✅ Módulo 1 COMPLETADO (100%)
- ⏳ Módulo 2 es el SIGUIENTE
- 📍 Progreso: 14% (1 de 7 módulos)

### **2. Ubicación del Proyecto**

Estás en el directorio raíz del proyecto: `unimar-migration/`

### **3. Servidores Activos**

- Backend: `http://localhost:8000` (Laravel 11)
- Frontend: `http://localhost:3000` (Next.js 14)

---

## 📄 DOCUMENTOS IMPORTANTES (en orden de lectura)

1. **`CONTEXTO_PROYECTO.md`** ⭐ **LEE PRIMERO**

   - Contexto completo del proyecto
   - Estado actual detallado
   - Plan de todos los módulos

2. **`MODULO_2_Base_Datos_Migraciones.md`** ⏳ **SIGUIENTE TAREA**

   - 7 migraciones a crear
   - Sistema de bloques flexibles
   - Seeders y modelos

3. **`GUIA_TRABAJO.md`**

   - Guía completa de trabajo
   - Identidad gráfica UNIMAR
   - Reglas importantes

4. **`VERIFICACION_MODULO_1.md`**
   - Verificación del módulo completado
   - URLs de prueba
   - Archivos creados

---

## 🎯 PRÓXIMA TAREA INMEDIATA

### **Módulo 2: Base de Datos y Migraciones**

**Primera acción:**

```bash
cd backend
php artisan make:migration create_publication_types_table
```

**Archivos a crear (en orden):**

1. Migración: `create_publication_types_table`
2. Migración: `create_publications_table`
3. Migración: `create_publication_blocks_table` ⭐ CLAVE
4. Migración: `create_publication_author_table`
5. Migración: `create_publication_publication_type_table`
6. Migración: `create_analytics_events_table`
7. Seeder: `PublicationTypeSeeder`
8. Seeder: `UserSeeder`

**Tiempo estimado:** 4-6 días

---

## 🎨 REGLAS CLAVE (SIEMPRE SEGUIR)

### **1. Colores UNIMAR (Obligatorios)**

```css
#0b3d91  /* Azul oscuro - Botones, headers */
#d0e0fc  /* Azul claro - Fondos */
#336699  /* Azul medio - Enlaces */
```

### **2. Fuente (Obligatoria)**

```css
font-family: "Montserrat", sans-serif;
```

### **3. Sistema de Bloques**

- Contenido en bloques separados (NO un solo campo de texto)
- Orden flexible: texto-imagen-texto-video-imagen
- Tipos: text, image, video, embed, divider

### **4. IA con Gemini**

- ❌ NO autocompletado en tiempo real
- ✅ Solo sugerencias manuales (botones)
- Modelo: `gemini-pro`

### **5. Next.js**

- Páginas públicas: SSG
- Páginas admin: SSR
- TypeScript siempre

---

## 🔑 CONCEPTO CLAVE: Sistema de Bloques

**Publicación tradicional (sistema viejo):**

```
- Título
- Descripción (texto plano)
- Imagen (una sola)
```

**Publicación nueva (sistema de bloques):**

```
- Título
- Descripción corta
- Bloques:
  ├── Bloque 1: texto (Quill.js)
  ├── Bloque 2: imagen
  ├── Bloque 3: texto
  ├── Bloque 4: video
  └── Bloque 5: texto
```

**Tabla clave:**

```sql
publication_blocks
├── id
├── publication_id (FK)
├── type (text, image, video, embed, divider)
├── content (JSON)  -- Estructura flexible
├── order           -- Orden de aparición
└── timestamps
```

---

## 📊 PLAN COMPLETO (7 Módulos)

| #   | Módulo                | Estado  | Tiempo     | Tareas |
| --- | --------------------- | ------- | ---------- | ------ |
| 1   | Configuración Inicial | ✅ 100% | 2-3 días   | 25     |
| 2   | Base de Datos         | ⏳ 0%   | 4-6 días   | 22     |
| 3   | Backend + Gemini      | ⏳ 0%   | 7-9 días   | 30     |
| 4   | Autenticación         | ⏳ 0%   | 2-3 días   | 12     |
| 5   | Frontend + Quill      | ⏳ 0%   | 10-14 días | 35     |
| 7   | Dashboard             | ⏳ 0%   | 4-6 días   | 18     |
| 8   | Testing + Deploy      | ⏳ 0%   | 3-5 días   | 15     |

**Total:** 35-50 días, 155 tareas

---

## 💻 COMANDOS RÁPIDOS

### **Backend (Laravel)**

```bash
# Navegar
cd backend

# Crear migración
php artisan make:migration nombre_migracion

# Ejecutar migraciones
php artisan migrate

# Crear seeder
php artisan make:seeder NombreSeeder

# Ejecutar seeders
php artisan db:seed
```

### **Frontend (Next.js)**

```bash
# Navegar
cd frontend

# Iniciar servidor
npm run dev
```

---

## ✅ CHECKLIST ANTES DE EMPEZAR

- [ ] Leí `CONTEXTO_PROYECTO.md`
- [ ] Leí `MODULO_2_Base_Datos_Migraciones.md`
- [ ] Entiendo el sistema de bloques flexibles
- [ ] Conozco los colores UNIMAR (#0b3d91, #d0e0fc, #336699)
- [ ] Sé que NO debo implementar autocompletado
- [ ] Backend y Frontend están corriendo

---

## 🎯 RESUMEN EN 3 PUNTOS

1. **Proyecto:** Migración de sistema multimedia de UNIMAR de PHP a Laravel + Next.js
2. **Estado:** Módulo 1 completado, siguiente es Módulo 2 (Base de Datos)
3. **Clave:** Sistema de bloques flexibles + Identidad UNIMAR + Gemini sin autocompletado

---

**¡Listo para continuar! 🚀**

**Siguiente paso:** Abrir `MODULO_2_Base_Datos_Migraciones.md` y empezar a crear migraciones.
