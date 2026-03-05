'use client';

import { useState, useEffect } from 'react';
import { useIngestStore } from '@/stores/useIngestStore';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import TagCombobox, { Tag } from '@/components/TagCombobox';
import CategoryCombobox, { Category } from '@/components/CategoryCombobox';
import LocationCombobox from '@/components/LocationCombobox';

const MySwal = withReactContent(Swal);

export default function IngestSidebar() {
  const { files, selectedIds, updateSelectedMetadata, removeSelected, isUploading } = useIngestStore();
  
  const [bulkData, setBulkData] = useState<{
    category: Category | null;
    tags: Tag[];
    description?: string;
    date_taken?: string;
    location?: string;
  }>({
    category: null,
    tags: [],
    description: '',
    date_taken: '',
    location: '',
  });

  const selectedFiles = files.filter((f) => selectedIds.includes(f.id));
  const hasSelection = selectedFiles.length > 0;
  const hasFiles = files.length > 0;
  const isSingleSelection = selectedFiles.length === 1;
  const isSelectedImage = hasSelection && selectedFiles[0].file.type.startsWith('image/');

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fecha de hoy en formato YYYY-MM-DD (para min y valor por defecto)
  const todayStr = new Date().toISOString().split('T')[0];

  // Load metadata when selecting a SINGLE file
  useEffect(() => {
    if (isSingleSelection) {
      const file = selectedFiles[0];
      setBulkData({
        category: null,
        tags: [],
        description: file.description || '',
        date_taken: file.date_taken
          ? file.date_taken.split('T')[0]
          : todayStr,
        location: file.location || '',
      });
    } else {
      setBulkData({
        category: null,
        tags: [],
        description: '',
        date_taken: todayStr,
        location: '',
      });
    }
  }, [selectedIds.join(','), files]);

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Genera título y descripción con IA para el archivo seleccionado
  const generateAIMetadata = async () => {
    if (!hasSelection) return;
    setIsAiLoading(true);
    try {
      const fileContext = selectedFiles[0];
      const base64Data = await fileToBase64(fileContext.file);

      const response = await api.post('/ai/media/analyze-base64', {
        image_base64: base64Data,
        mime_type: fileContext.file.type || 'image/jpeg',
        title: fileContext.title || '',
        description: bulkData.description || '',
      });

      if (response.data) {
        const aiTitle = response.data.title || fileContext.title;
        const aiDescription = response.data.description || bulkData.description;

        // Actualizar AMBOS en el store y en bulkData de forma sincronizada
        // para evitar el race condition con el useEffect
        if (isSingleSelection) {
          const updates: any = {};
          if (response.data.title) updates.title = aiTitle;
          if (response.data.description) updates.description = aiDescription;
          useIngestStore.getState().updateFileMetadata(fileContext.id, updates);
        }

        // Actualizar bulkData directamente (la descripción visible en el textarea)
        // Usamos un timeout mínimo para que el useEffect no la sobrescriba
        // porque updateFileMetadata triggerea la dependencia [files] del useEffect
        setTimeout(() => {
          setBulkData(prev => ({
            ...prev,
            description: aiDescription,
          }));
        }, 50);

        MySwal.fire({
          icon: 'success',
          title: 'Auto IA completado',
          html: response.data.title
            ? `<b>Título:</b> ${aiTitle}<br><b>Descripción</b> generada correctamente.`
            : 'Descripción generada correctamente.',
          timer: 3000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl border border-unimar-surface shadow-xl' },
        });
      }
    } catch (error) {
      console.error('Error in AI Metadata Generation:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error de IA',
        text: 'Hubo un problema al analizar la imagen con IA.',
        timer: 3000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-2xl border border-unimar-surface shadow-xl' },
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyToSelected = () => {
    const updates: any = {};
    if (bulkData.tags.length > 0) updates.tags = bulkData.tags.map(t => t.name);
    if (bulkData.description) updates.description = bulkData.description;
    if (bulkData.date_taken) updates.date_taken = bulkData.date_taken;
    if (bulkData.location) updates.location = bulkData.location;

    if (Object.keys(updates).length > 0) {
      updateSelectedMetadata(updates);
      MySwal.fire({
        icon: 'success',
        title: '¡Cambios aplicados!',
        text: 'Los metadatos se han actualizado correctamente.',
        timer: 1500,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-2xl border border-unimar-surface shadow-xl',
        }
      });
    }
  };

  const handleUpload = async (uploadAll: boolean = false) => {
    // Determine which files to upload
    let filesToUpload = uploadAll ? files : selectedFiles;
    
    // Safety check
    if (filesToUpload.length === 0) return;

    // Validación: cada archivo debe tener título no vacío y al menos 1 tag
    // Consideramos tanto los tags ya aplicados en el store como los pendientes en bulkData
    const pendingTagNames = bulkData.tags.map(t => t.name);
    const filesWithoutTags = filesToUpload.filter(f => {
      const fileTags = Array.isArray(f.tags) ? f.tags : [];
      return fileTags.length === 0 && pendingTagNames.length === 0;
    });
    const filesWithoutTitle = filesToUpload.filter(f => !f.title?.trim());

    if (filesWithoutTitle.length > 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Títulos en blanco',
        html: `Los siguientes archivos no tienen título:<br><b>${filesWithoutTitle.map(f => f.file.name).join('<br>')}</b><br><br>Cada archivo debe tener un nombre antes de subirse.`,
        confirmButtonText: 'Entendido',
        customClass: { popup: 'rounded-2xl border border-unimar-surface shadow-xl' },
      });
      return;
    }

    if (filesWithoutTags.length > 0) {
      MySwal.fire({
        icon: 'warning',
        title: 'Etiquetas requeridas',
        html: `Los siguientes archivos no tienen etiquetas:<br><b>${filesWithoutTags.map(f => f.file.name).join('<br>')}</b><br><br>Selecciona al menos una etiqueta en el sidebar y haz clic en <b>"Aplicar a seleccionados"</b>, o usa el campo de Etiquetas del sidebar masivo.`,
        confirmButtonText: 'Entendido',
        customClass: { popup: 'rounded-2xl border border-unimar-surface shadow-xl' },
      });
      return;
    }

    // UX FIX: Auto-apply metadata if user forgot to click "Apply"
    // Check if there is data in the form AND we have selected files (or uploading all)
    // If uploading all, we apply to ALL. If uploading selection, apply to selection.
    // Logic: If there is text in any field, assume user wants to use it.
    
    const hasPendingChanges =
      bulkData.tags.length > 0 ||
      bulkData.description ||
      bulkData.date_taken ||
      bulkData.location;

    // We only auto-apply if:
    // 1. There are pending changes in the form
    // 2. The user is currently editing something (hasSelection or uploadAll matches current context)
    // 3. For "Upload All", we might want to be careful, but generally if they typed an Author, they want it.
    
    let updatedFiles = [...filesToUpload];

    if (hasPendingChanges) {
       console.log('Auto-applying pending metadata changes before upload...');
       
       const updates: any = {};
       if (bulkData.tags.length > 0) updates.tags = bulkData.tags.map(t => t.name);
       if (bulkData.description) updates.description = bulkData.description;
       if (bulkData.date_taken) updates.date_taken = bulkData.date_taken;
       if (bulkData.location) updates.location = bulkData.location;
       
       // Update the local array we are about to use for upload
       updatedFiles = updatedFiles.map(f => ({ ...f, ...updates }));
       
       // Also update the store to reflect visual state (so UI doesn't look out of sync if upload fails)
       if (uploadAll) {
         // This is a bit heavy but correct
         useIngestStore.getState().files.forEach(f => useIngestStore.getState().updateFileMetadata(f.id, updates));
       } else {
         updateSelectedMetadata(updates);
       }
    }

    try {
      useIngestStore.getState().setUploading(true);
      setUploadProgress(0);
      
      let totalBytes = 0;
      updatedFiles.forEach(f => totalBytes += f.file.size);
      let uploadedBytes = 0;

      for (const fileData of updatedFiles) {
        const file = fileData.file;
        const chunkSize = 5 * 1024 * 1024; // 5MB por chunk
        const totalChunks = Math.ceil(file.size / chunkSize);
        
        // Usar crypto.randomUUID() o una alternativa sencilla
        const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);

        for (let i = 0; i < totalChunks; i++) {
          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('file_id', fileId);
          formData.append('chunk_index', i.toString());
          formData.append('total_chunks', totalChunks.toString());
          formData.append('file_name', file.name);
          formData.append('mime_type', file.type);
          
          // Enviar metadatos únicamente en el último chunk
          if (i === totalChunks - 1) {
            formData.append('file_metadata', JSON.stringify({
              title: fileData.title,
              description: fileData.description,
              tags: fileData.tags,
              date_taken: fileData.date_taken,
              location: fileData.location,
            }));
          }

          await api.post('/ingest/upload-chunk', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 0 // Evitar timeout en videos masivos
          });
          
          uploadedBytes += chunk.size;
          const percentCompleted = Math.round((uploadedBytes / totalBytes) * 100);
          setUploadProgress(percentCompleted);
        }
      }

      // Success feedback and state cleanup
      MySwal.fire({
        icon: 'success',
        title: '¡Archivos subidos!',
        text: `${filesToUpload.length} archivo(s) se han cargado exitosamente.`,
        confirmButtonText: 'Genial',
        confirmButtonColor: '#0b3d91',
        customClass: {
          popup: 'rounded-2xl border border-unimar-surface shadow-xl',
        }
      });
      
      if (uploadAll) {
        useIngestStore.getState().clearAll();
      } else {
        removeSelected();
      }
      setBulkData({ category: null, tags: [], description: '', date_taken: '', location: '' });
      
    } catch (error) {
      console.error('Upload failed:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al subir los archivos. Por favor intenta de nuevo.',
        confirmButtonColor: '#EF4444',
        customClass: {
          popup: 'rounded-2xl border border-unimar-surface shadow-xl',
        }
      });
    } finally {
      useIngestStore.getState().setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md h-fit sticky top-24 overflow-hidden border border-gray-100">
      {/* Header - Same blue as navbar (#30669a) */}
      <div className="px-5 py-4" style={{ backgroundColor: '#30669a' }}>
        <h3 className="text-white font-bold flex items-center gap-2">
           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/></svg>
           {hasSelection ? 'Edición' : 'Subir Archivos'}
           {isSingleSelection && ' Individual'}
           {hasSelection && !isSingleSelection && ' Masiva'}
        </h3>
        <p className="text-white/80 text-xs mt-1 font-medium">
          {hasSelection
            ? `${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''} seleccionado${selectedFiles.length !== 1 ? 's' : ''}`
            : hasFiles 
              ? `${files.length} archivo${files.length !== 1 ? 's' : ''} listo${files.length !== 1 ? 's' : ''} para subir`
              : 'Selecciona archivos para editar'
          }
        </p>
      </div>

      {/* Barra de progreso de upload */}
      {isUploading && (
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-600">
              {uploadProgress < 100 ? 'Subiendo archivos...' : 'Procesando en servidor...'}
            </span>
            <span className="text-xs font-bold text-[#30669a]">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${uploadProgress}%`,
                background: uploadProgress === 100
                  ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                  : 'linear-gradient(90deg, #30669a, #5b9bd5)',
              }}
            />
          </div>
          {uploadProgress === 100 && (
            <p className="text-[10px] text-green-600 mt-1 font-medium">✓ Transferencia completa. Procesando...</p>
          )}
        </div>
      )}

      {/* Body - White background */}
      <div className="p-5 space-y-5 bg-white">
        {!hasSelection && !hasFiles ? (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Arrastra archivos o haz clic en la zona de carga.</p>
          </div>
        ) : !hasSelection && hasFiles ? (
          // No selection but has files - show "Upload All" button
          <div className="space-y-4">
            <div className="text-center py-4 text-slate-500">
              <svg className="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">Archivos listos</p>
              <p className="text-xs text-slate-400 mt-1">Selecciona archivos para editar metadatos o sube todos directamente.</p>
            </div>
            
            <button
              onClick={() => handleUpload(true)}
              disabled={isUploading}
              className="btn-primary w-full shadow-lg"
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {uploadProgress > 0 && uploadProgress < 100 ? `Subiendo... ${uploadProgress}%` : uploadProgress === 100 ? 'Procesando...' : 'Preparando...'}
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Subir Todos ({files.length})
                </>
              )}
            </button>
          </div>
        ) : (
          <>

            {/* Categoría */}
            <div className="space-y-1">
              <label className="label-unimar">Categoría</label>
              <CategoryCombobox
                value={bulkData.category ? [bulkData.category] : []}
                onChange={(cats) => setBulkData(prev => ({ ...prev, category: cats.length > 0 ? cats[cats.length - 1] : null, tags: [] }))}
                placeholder="Selecciona una categoría..."
              />
              <p className="text-[10px] text-slate-400 italic">Las etiquetas se filtrarán por la categoría elegida.</p>
            </div>

            {/* Tags — Combobox con búsqueda */}
            <div className="space-y-1">
              <label className="label-unimar">
                Etiquetas
              </label>
              <TagCombobox
                value={bulkData.tags}
                onChange={(tags) => setBulkData({ ...bulkData, tags })}
                placeholder="Buscar etiqueta..."
                categoryId={bulkData.category?.id ?? null}
              />
              <p className="text-[10px] text-slate-400 italic">Selecciona del catálogo. Los tags se crean desde Configuración.</p>
            </div>

            {/* Nueva Metadata Bulk */}
            <div className="grid grid-cols-1 gap-3">
               <div className="space-y-1">
                 <label className="label-unimar">Fecha del evento</label>
                 <input
                   type="date"
                   value={bulkData.date_taken || todayStr}
                   min={todayStr}
                   onChange={(e) => setBulkData({ ...bulkData, date_taken: e.target.value })}
                   className="input-unimar"
                 />
                 <p className="text-[10px] text-slate-400 italic">Por defecto: hoy. No se pueden seleccionar fechas pasadas.</p>
               </div>
            </div>

            <div className="space-y-1">
               <label className="label-unimar">Ubicación</label>
               <LocationCombobox
                 value={bulkData.location || ''}
                 onChange={(val) => setBulkData({ ...bulkData, location: val })}
                 placeholder="Buscar ubicación..."
               />
               <p className="text-[10px] text-slate-400 italic">Selecciona del catálogo o escribe una ubicación.</p>
            </div>

            <div className="space-y-1">
               <label className="label-unimar flex justify-between items-center">
                 <span>Descripción {!isSingleSelection && 'Masiva'}</span>
                 <button
                   onClick={generateAIMetadata}
                   disabled={isAiLoading || !hasSelection || !isSelectedImage}
                   className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded-md transition-colors disabled:opacity-50 disabled:grayscale"
                   title={!isSelectedImage ? "Esta función solo está disponible para imágenes" : "Generar título y descripción con IA"}
                 >
                   {isAiLoading ? (
                     <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                     </svg>
                   ) : (
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                     </svg>
                   )}
                   Auto IA
                 </button>
               </label>
               <textarea
                 value={bulkData.description || ''}
                 onChange={(e) => setBulkData({ ...bulkData, description: e.target.value })}
                 className="input-unimar h-20 resize-none"
                 placeholder={isSingleSelection ? "Descripción del archivo..." : "Se aplicará a todos (cuidado)..."}
               />
               <p className="text-[10px] text-slate-400 italic">Ej: Fotos del acto de graduación de la promoción 2025-II</p>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyToSelected}
              disabled={bulkData.tags.length === 0 && !bulkData.description && !bulkData.location && !bulkData.date_taken}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar a seleccionados
            </button>

            <hr className="border-slate-100" />

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleUpload(false)}
                disabled={isUploading}
                className="btn-primary w-full shadow-lg"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Subiendo...
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline-block -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Subir Seleccionados ({selectedFiles.length})
                  </>
                )}
              </button>

              <button
                onClick={removeSelected}
                className="w-full py-3 text-red-500 hover:bg-red-50 font-medium rounded-xl transition-all"
              >
                Eliminar seleccionados
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
