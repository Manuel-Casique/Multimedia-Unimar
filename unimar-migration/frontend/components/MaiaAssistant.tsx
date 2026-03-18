'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { driver, DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

/* ───────────────────── Tour Steps per Route ───────────────────── */

const tourSteps: Record<string, DriveStep[]> = {

  '/dashboard': [
    { element: '#page-title', popover: { title: 'Panel de Control', description: 'Esta es la pantalla principal del sistema multimedia. Desde aquí puedes ver un resumen completo de la actividad del sistema, acceder rápidamente a cualquier módulo y monitorear el estado general de los recursos.', side: 'bottom' } },
    { element: '#quick-access', popover: { title: 'Acceso Rápido', description: 'Esta sección contiene botones de acceso directo a los módulos más utilizados del sistema: Subir Archivos, Ver Galería, Estadísticas, Perfil, y si eres administrador, también verás accesos a Taxonomía, Gestión de Usuarios y Respaldo de Base de Datos. Haz clic en cualquiera para navegar directamente.', side: 'bottom' } },
    { element: '#stats-summary', popover: { title: 'Resumen de Archivos', description: 'Estas tres tarjetas muestran contadores en tiempo real: el número total de archivos almacenados en el sistema, la cantidad de imágenes y la cantidad de videos. Los datos se actualizan cada vez que entras al panel.', side: 'bottom' } },
    { element: '#recent-activity', popover: { title: 'Actividad Reciente', description: 'Esta tabla muestra los últimos archivos multimedia que han sido subidos al sistema. Para cada archivo puedes ver su nombre, el tipo de archivo (imagen, video, audio), la fecha de subida y su estado de procesamiento. Haz clic en "Ver todo" para ir a la galería completa.', side: 'top' } },
    { element: '#publications-summary', popover: { title: 'Resumen de Publicaciones', description: 'Este panel muestra un conteo rápido de tus publicaciones dividido en tres estados: Total, Publicadas y Borradores. Debajo aparecen las publicaciones más recientes con su título, tiempo transcurrido y estado actual. Haz clic en cualquiera para editarla directamente.', side: 'top' } },
    { element: '#catalog-summary', popover: { title: 'Catálogo y Taxonomía', description: 'Esta sección muestra cuántas categorías, etiquetas y ubicaciones tienes configuradas en el sistema. Estos elementos son los que se usan para clasificar y organizar las publicaciones. Haz clic en "Gestionar" para ir al módulo de taxonomía.', side: 'top' } },
  ],

  '/ingest': [
    { element: '#page-title', popover: { title: 'Carga de Archivos Multimedia', description: 'Este módulo permite subir nuevos archivos al sistema multimedia. Puedes cargar imágenes (JPG, PNG, WebP, GIF), videos (MP4, MKV, AVI), audios (MP3, WAV) y documentos (PDF). Los archivos se procesan automáticamente al subirlos.', side: 'bottom' } },
    { element: '#dropzone-area', popover: { title: 'Zona de Carga', description: 'Arrastra y suelta tus archivos directamente sobre esta área, o haz clic para abrir el explorador de archivos. Puedes seleccionar múltiples archivos a la vez. El sistema generará automáticamente una miniatura de vista previa, extraerá los metadatos y calculará las dimensiones de cada archivo.', side: 'bottom' } },
    { element: '#upload-sidebar', popover: { title: 'Panel de Progreso', description: 'En este panel lateral aparecen los archivos que estás subiendo con su barra de progreso individual. Puedes ver el nombre del archivo, su tamaño, el porcentaje de subida y el estado (cargando, completado o error). Al terminar la carga, el archivo aparecerá automáticamente en la galería.', side: 'left' } },
  ],

  '/gallery': [
    { element: '#page-title', popover: { title: 'Galería de Archivos', description: 'La galería muestra todos los archivos multimedia almacenados en el sistema. Los archivos se agrupan por fecha de subida y se muestran en tarjetas visuales. Desde aquí puedes buscar, filtrar, editar metadatos, eliminar archivos y generar descripciones con inteligencia artificial.', side: 'bottom' } },
    { element: '#gallery-search', popover: { title: 'Barra de Búsqueda', description: 'Escribe cualquier término para buscar archivos por nombre o descripción. La búsqueda se aplica en tiempo real filtrando los resultados que se muestran en la cuadrícula inferior.', side: 'bottom' } },
    { element: '#gallery-filters', popover: { title: 'Filtros Avanzados', description: 'Usa estos filtros para refinar tu búsqueda. Puedes filtrar por: tipo de archivo (imagen, video, audio, documento), rango de fechas, etiquetas, categorías, ubicaciones, autores y orientación del archivo (horizontal, vertical o cuadrado). Los filtros se combinan entre sí para resultados más precisos.', side: 'bottom' } },
    { element: '#gallery-grid', popover: { title: 'Cuadrícula de Archivos', description: 'Cada tarjeta muestra una vista previa del archivo junto con su nombre, tipo, dimensiones y peso. Haz clic en una tarjeta para abrir el visor de detalles donde puedes ver el archivo completo, editar su título, descripción y etiquetas, o usar la IA para generar metadatos automáticamente. También puedes seleccionar varias tarjetas con los checkboxes para realizar acciones masivas como eliminar.', side: 'top' } },
    { element: '#gallery-pagination', popover: { title: 'Paginación', description: 'La galería divide los resultados en páginas para mejorar el rendimiento. Usa los botones de página para navegar entre los diferentes grupos de archivos. El número total de archivos y la página actual se muestran aquí.', side: 'top' } },
  ],

  '/publications': [
    { element: '#page-title', popover: { title: 'Gestión de Publicaciones', description: 'Este módulo permite crear, editar, publicar y administrar artículos y noticias de la universidad. Cada publicación puede tener un título, contenido enriquecido con formato, imagen de portada, categoría, etiquetas, ubicación y autor. Solo los administradores y editores tienen acceso a este módulo.', side: 'bottom' } },
    { element: '#publications-new-btn', popover: { title: 'Crear Nueva Publicación', description: 'Este botón abre el editor de publicaciones donde puedes escribir un nuevo artículo. El editor incluye un campo de título, un editor de texto enriquecido con barra de herramientas (negrita, cursiva, listas, enlaces, etc.), selector de imagen de portada desde la galería, y campos para asignar categoría, etiquetas, ubicación y autor.', side: 'left' } },
    { element: '#publications-search', popover: { title: 'Buscador de Publicaciones', description: 'Escribe el nombre de una publicación para filtrar la lista. La búsqueda filtra en tiempo real por título de la publicación.', side: 'bottom' } },
    { element: '#publications-filters', popover: { title: 'Filtros por Estado', description: 'Estas pestañas te permiten filtrar las publicaciones según su estado: "Todos" muestra todas, "Borradores" muestra las que aún no se han publicado, "Publicados" muestra las activas en la cartelera, y "Archivados" muestra las que se han retirado.', side: 'bottom' } },
    { element: '#publications-list', popover: { title: 'Lista de Publicaciones', description: 'Cada tarjeta de publicación muestra la imagen de portada, título, fecha, categoría y estado. En la esquina de cada tarjeta encontrarás botones para: ver en la cartelera pública, editar el contenido, cambiar el estado (Publicar, Archivar) o eliminar la publicación permanentemente.', side: 'top' } },
  ],

  '/publications/stats': [
    { element: '#page-title', popover: { title: 'Estadísticas de Publicaciones', description: 'Este panel muestra métricas y análisis sobre la actividad de publicaciones del sistema. Puedes ver tendencias, actividad por período y distribución del contenido.', side: 'bottom' } },
    { element: '#stats-cards', popover: { title: 'Contadores Principales', description: 'Estas tarjetas muestran los contadores más importantes: total de publicaciones creadas, publicaciones activas (publicadas), borradores pendientes y publicaciones archivadas. Los datos se actualizan en tiempo real.', side: 'bottom' } },
    { element: '#stats-charts', popover: { title: 'Gráficos de Análisis', description: 'Los gráficos interactivos muestran la distribución de publicaciones por categoría y la actividad de publicación por día o período. Puedes pasar el cursor sobre los gráficos para ver datos detallados de cada punto o barra.', side: 'bottom' } },
  ],

  '/stats': [
    { element: '#page-title', popover: { title: 'Estadísticas Multimedia', description: 'Este módulo presenta un análisis completo de los archivos multimedia almacenados en el sistema. Aquí puedes ver contadores, distribución por tipo, tendencias de subida y el uso de almacenamiento.', side: 'bottom' } },
    { element: '#stats-summary', popover: { title: 'Tarjetas de Resumen', description: 'Estas tarjetas muestran los datos principales del sistema: total de archivos almacenados, cantidad de imágenes, cantidad de videos y espacio total utilizado en disco. Los valores se actualizan automáticamente.', side: 'bottom' } },
    { element: '#stats-charts', popover: { title: 'Gráficos de Distribución', description: 'Los gráficos muestran visualmente cómo se distribuyen los archivos por tipo (imágenes, videos, audios, documentos), las tendencias de subida por día y las horas de mayor actividad. Pasa el cursor sobre cualquier elemento para ver valores exactos.', side: 'bottom' } },
  ],

  '/settings/catalog': [
    { element: '#page-title', popover: { title: 'Taxonomía del Sistema', description: 'La taxonomía define la estructura de clasificación del contenido. Desde aquí puedes administrar las tres entidades principales que organizan las publicaciones y archivos multimedia: Categorías, Etiquetas y Ubicaciones. Cada una cumple un rol diferente en la organización del contenido.', side: 'bottom' } },
    { element: '#categories-section', popover: { title: 'Gestión de Categorías', description: 'Las categorías son la clasificación principal del contenido. Cada publicación pertenece a una sola categoría (ej: Eventos, Académico, Deportes). Puedes crear nuevas categorías con el botón "Agregar", editarlas haciendo clic en el icono de lápiz, o eliminarlas con el icono de papelera. Las etiquetas del sistema dependen de la categoría seleccionada.', side: 'bottom' } },
    { element: '#tags-section', popover: { title: 'Gestión de Etiquetas', description: 'Las etiquetas son palabras clave que complementan la categoría. Una publicación puede tener múltiples etiquetas (ej: Graduación, 2026, Campus). Las etiquetas están asociadas a una categoría específica, por lo que primero debes seleccionar la categoría para ver sus etiquetas. Puedes crear, editar y eliminar etiquetas de la misma forma que las categorías.', side: 'bottom' } },
    { element: '#locations-section', popover: { title: 'Gestión de Ubicaciones', description: 'Las ubicaciones representan espacios físicos de la universidad como aulas, auditorios, laboratorios o áreas externas. Son opcionales al crear publicaciones y permiten indicar dónde ocurrió un evento. Puedes agregar nuevas ubicaciones, editarlas o eliminarlas desde esta sección.', side: 'bottom' } },
  ],

  '/settings/users': [
    { element: '#page-title', popover: { title: 'Gestión de Usuarios', description: 'Esta sección está restringida a administradores y permite controlar el acceso al sistema. Aquí puedes ver todos los usuarios registrados, cambiar sus roles de seguridad y crear nuevas cuentas para miembros de la universidad.', side: 'bottom' } },
    { element: '#users-table', popover: { title: 'Tabla de Usuarios', description: 'Esta tabla muestra todos los usuarios registrados en el sistema con su nombre completo, correo institucional, rol actual y la opción de cambiar el rol. Los tres roles disponibles son: Administrador (acceso total al sistema, puede gestionar usuarios, respaldos y configuraciones), Editor (puede crear y editar publicaciones y subir multimedia) y Usuario (solo puede visualizar el contenido sin hacer modificaciones). Para cambiar un rol, simplemente haz clic en el botón correspondiente.', side: 'top' } },
    { element: '#add-user-btn', popover: { title: 'Agregar Nuevo Usuario', description: 'Este botón abre un formulario para registrar un nuevo usuario en el sistema. Se requiere: nombre, apellido, correo electrónico institucional (obligatoriamente con dominio @unimar.edu.ve), una contraseña de al menos 6 caracteres, y la selección del rol inicial. Solo el administrador puede crear cuentas nuevas.', side: 'left' } },
  ],

  '/settings': [
    { element: '#page-title', popover: { title: 'Respaldo y Seguridad', description: 'Esta pantalla es el centro de protección de datos del sistema. Desde aquí puedes generar copias de seguridad completas de la base de datos MySQL en formato SQL, descargar respaldos existentes a tu computadora y eliminar los que ya no necesites. Es recomendable generar un respaldo antes de hacer cambios importantes.', side: 'bottom' } },
    { element: '#backup-generate-card', popover: { title: 'Generar Nuevo Respaldo', description: 'En esta tarjeta encontrarás el botón "Generar Nuevo Respaldo". Al presionarlo, el sistema ejecuta el comando mysqldump en segundo plano para crear un archivo SQL con toda la estructura de tablas y los datos actuales de la base de datos. El proceso tarda entre 2 y 10 segundos dependiendo del tamaño. El archivo generado aparecerá automáticamente en la tabla del historial.', side: 'right' } },
    { element: '#backup-history-card', popover: { title: 'Historial de Respaldos', description: 'Esta tabla muestra cronológicamente todos los respaldos generados. Para cada uno puedes ver: el nombre del archivo (incluye la fecha y hora), la fecha de creación, y el tamaño del archivo. En la columna de Acciones tienes dos botones: "Descargar" guarda una copia del archivo SQL en tu computadora local, y "Eliminar" borra permanentemente el respaldo del servidor (se te pedirá confirmación antes).', side: 'left' } },
  ],

  '/profile': [
    { element: '#page-title', popover: { title: 'Mi Perfil', description: 'Esta pantalla permite ver y editar tu información personal dentro del sistema. Los datos que configures aquí se reflejan en toda la plataforma: en la barra de navegación, en las publicaciones que crees y en los registros del sistema.', side: 'bottom' } },
    { element: '#profile-photo', popover: { title: 'Foto de Perfil', description: 'Tu foto de perfil aparece en la barra de navegación superior y junto a tu nombre en los registros del sistema. Haz clic sobre la imagen para cambiarla. Se recomienda usar una foto cuadrada de al menos 200x200 píxeles para mejor calidad. La imagen se recortará automáticamente en formato circular.', side: 'right' } },
    { element: '#profile-form', popover: { title: 'Datos Personales', description: 'Aquí puedes actualizar tu nombre y apellido. El campo de correo electrónico es de solo lectura por razones de seguridad ya que es tu identificador único en el sistema. Los cambios se guardan al presionar el botón "Actualizar Perfil". También puedes cambiar tu contraseña ingresando la contraseña actual y la nueva.', side: 'left' } },
  ],
};

/* ───────────────────── Component ───────────────────── */

export default function MaiaAssistant() {
  const pathname = usePathname();
  const [showBubble, setShowBubble] = useState(false);

  // Close bubble when navigating
  useEffect(() => {
    setShowBubble(false);
  }, [pathname]);

  const startTour = useCallback(() => {
    setShowBubble(false);

    // Get steps for the current page — only include steps whose elements exist in the DOM
    const rawSteps = tourSteps[pathname] || [];
    const steps = rawSteps.filter(
      (step) => !step.element || document.querySelector(step.element as string)
    );

    if (steps.length === 0) {
      const d = driver({
        showProgress: false,
        animate: true,
        overlayColor: 'rgba(0,0,0,0.55)',
        popoverClass: 'maia-popover',
        nextBtnText: 'Siguiente',
        prevBtnText: 'Atrás',
        doneBtnText: 'Entendido',
      });
      d.highlight({
        element: '#page-title',
        popover: {
          title: 'MAIA',
          description: 'Esta pantalla aún no tiene un recorrido configurado. Puedes explorar libremente. Si necesitas ayuda, haz clic en mí de nuevo.',
        }
      });
      return;
    }

    const d = driver({
      showProgress: true,
      progressText: '{{current}} de {{total}}',
      animate: true,
      overlayColor: 'rgba(0,0,0,0.55)',
      popoverClass: 'maia-popover',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Atrás',
      doneBtnText: 'Entendido',
      steps: steps,
    });
    d.drive();
  }, [pathname]);

  return (
    <>
      {/* Floating Blue Circle — BOTTOM RIGHT */}
      <button
        id="maia-btn"
        onClick={() => setShowBubble(!showBubble)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl group"
        style={{
          background: 'linear-gradient(135deg, #30669a 0%, #1d4773 100%)',
        }}
        title="MAIA — Tu asistente"
      >
        <span className="text-white font-bold text-xl select-none group-hover:scale-110 transition-transform">
          M
        </span>
        <span className="absolute w-full h-full rounded-full border-2 border-[#30669a]/40 animate-ping pointer-events-none" />
      </button>

      {/* Dialog Bubble — anchored to BOTTOM RIGHT */}
      {showBubble && (
        <div
          className="fixed bottom-24 right-6 z-[9999] w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ animation: 'maiaFadeIn 0.25s ease-out' }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#30669a' }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">MAIA</p>
              <p className="text-white/70 text-[10px]">Asistente de Medios Audiovisuales</p>
            </div>
          </div>
          {/* Body */}
          <div className="p-4">
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              Hola, soy <strong>MAIA</strong>, tu asistente de medios audiovisuales personal.
              ¿Quieres aprender a utilizar esta pantalla?
            </p>
            <div className="flex gap-2">
              <button
                onClick={startTour}
                className="flex-1 py-2 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90"
                style={{ backgroundColor: '#30669a' }}
              >
                Sí, enséñame
              </button>
              <button
                onClick={() => setShowBubble(false)}
                className="flex-1 py-2 text-sm font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Ahora no
              </button>
            </div>
          </div>

          {/* Arrow pointing to circle — right side */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-200" />
        </div>
      )}

      {/* Animation keyframes & Driver.js overrides */}
      <style jsx global>{`
        @keyframes maiaFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .maia-popover {
          border-radius: 16px !important;
          font-family: 'Montserrat', 'Roboto', sans-serif !important;
        }

        .maia-popover .driver-popover-title {
          font-weight: 700 !important;
          color: #30669a !important;
          font-size: 16px !important;
        }

        .maia-popover .driver-popover-description {
          color: #334155 !important;
          line-height: 1.6 !important;
          font-size: 13px !important;
        }

        .maia-popover .driver-popover-navigation-btns button {
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 13px !important;
          padding: 6px 16px !important;
        }

        .maia-popover .driver-popover-next-btn,
        .maia-popover .driver-popover-close-btn {
          background-color: #30669a !important;
          color: white !important;
          border: none !important;
          text-shadow: none !important;
        }
        
        .maia-popover .driver-popover-prev-btn {
          background-color: #f1f5f9 !important;
          color: #475569 !important;
          border: 1px solid #e2e8f0 !important;
        }

        .maia-popover .driver-popover-progress-text {
          color: #94a3b8 !important;
          font-size: 11px !important;
        }
      `}</style>
    </>
  );
}
