# 🎬 Multimedia Unimar

> Sistema integral para la gestión, almacenamiento y distribución de medios audiovisuales y publicaciones de la Universidad de Margarita (UNIMAR).

![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

---

## 📖 Descripción del Proyecto

**Multimedia Unimar** es una plataforma moderna diseñada para centralizar y optimizar el flujo de trabajo de los recursos multimedia de la universidad. El sistema permite la ingesta masiva de archivos, organización mediante metadatos, y la creación de publicaciones enriquecidas, todo potenciado por análisis de datos e Inteligencia Artificial.

El proyecto representa una migración y modernización tecnológica, separando el backend (API RESTful en Laravel) del frontend (SPA en Next.js), asegurando escalabilidad, seguridad y una experiencia de usuario premium.

---

## 🚀 Funcionalidades Clave

### 📸 Gestión de Medios (Media Ingest & Gallery)

- **Ingesta Masiva**: Carga de múltiples archivos (imágenes, videos) con procesamiento automático (Intervention Image).
- **Metadatos y Organización**: Categorización, etiquetado y gestión de autores.
- **Galería Interactiva**: Visualización de medios con filtros avanzados y opciones de edición por lotes.

### 📝 Publicaciones y Contenido (CMS)

- **Editor de Bloques**: Sistema flexible para crear artículos y noticias.
- **Tipos de Publicación**: Soporte para diferentes formatos de contenido.
- **Integración de Medios**: Inserción directa de imágenes desde la galería centralizada.

### 📊 Dashboard y Analítica

- **Panel de Control**: Vista general de la actividad reciente, estadísticas de carga y estado del sistema.
- **Analítica de Eventos**: Rastreo de visualizaciones e interacciones con las publicaciones (`AnalyticsEvent`).
- **Visualización de Datos**: Gráficos interactivos (Recharts) para la toma de decisiones.

### 🤖 Inteligencia Artificial (Google Gemini)

- **Integración con Gemini API**: Potenciación de funcionalidades mediante IA, como generación de descripciones, etiquetado automático o asistencia en la redacción.

### 🔐 Seguridad y Usuarios

- **Autenticación Robusta**: Implementación de Laravel Sanctum para seguridad vía API tokens.
- **Gestión de Roles**: Control de acceso granular mediante `spatie/laravel-permission`.
- **Perfiles de Usuario**: Gestión de información personal y fotos de perfil.

---

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura **Headless**, con el backend sirviendo datos vía API al frontend.

### Backend (API)

- **Framework**: Laravel 11
- **Lenguaje**: PHP 8.2+
- **Base de Datos**: MySQL
- **IA**: Google Gemini PHP Client
- **Procesamiento de Imágenes**: Intervention Image
- **Autenticación**: Laravel Sanctum

### Frontend (Cliente)

- **Framework**: Next.js 14 (App Router)
- **Librería UI**: React 18
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado Global**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Editor de Texto**: React Quill
- **Visualización**: Recharts

---

## 🎯 Objetivos del Sistema

1.  **Centralización**: Unificar todos los activos digitales de la universidad en un solo repositorio accesible y seguro.
2.  **Modernización**: Reemplazar sistemas legados con tecnologías de vanguardia para mejorar el rendimiento y la mantenibilidad.
3.  **Automatización**: Reducir la carga manual mediante herramientas de ingesta inteligente y asistencia por IA.
4.  **Escalabilidad**: Preparar la infraestructura para el crecimiento futuro de datos y usuarios.
