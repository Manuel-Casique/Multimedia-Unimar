'use client';

import { useState, useEffect } from 'react';
import { useIngestStore } from '@/stores/useIngestStore';
import { useUploadStore, UploadFileData } from '@/stores/useUploadStore';
import api from '@/lib/api';
import toast from '@/lib/toast';
import TagCombobox, { Tag } from '@/components/TagCombobox';
import CategoryCombobox, { Category } from '@/components/CategoryCombobox';
import LocationCombobox from '@/components/LocationCombobox';
import AuthorCombobox, { Author } from '@/components/AuthorCombobox';

export default function IngestSidebar() {
  const { files, selectedIds, updateSelectedMetadata, removeSelected, isUploading } = useIngestStore();
  
  const [bulkData, setBulkData] = useState<{
    category: Category | null;
    tags: Tag[];
    authors: Author[];
    description?: string;
    date_taken?: string;
    location?: string;
  }>({
    category: null,
    tags: [],
    authors: [],
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
  const { isUploading: globalUploading, startUpload } = useUploadStore();

  // Fecha de hoy en formato YYYY-MM-DD (para min y valor por defecto)
  const todayStr = new Date().toISOString().split('T')[0];

  // Load metadata when selecting a SINGLE file
  useEffect(() => {
    if (isSingleSelection) {
      const file = selectedFiles[0];
      setBulkData({
        category: null,
        tags: [],
        authors: file.authors || [],
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
        authors: [],
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

        toast.success('Auto IA completado', response.data.title
            ? `Título y descripción generados.`
            : 'Descripción generada correctamente.');
      }
    } catch (error) {
      console.error('Error in AI Metadata Generation:', error);
      toast.error('Error de IA', 'Hubo un problema al analizar la imagen con IA.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyToSelected = () => {
    const updates: any = {};
    if (bulkData.tags.length > 0) updates.tags = bulkData.tags.map(t => t.name);
    if (bulkData.authors.length > 0) updates.authors = bulkData.authors;
    if (bulkData.description) updates.description = bulkData.description;
    if (bulkData.date_taken) updates.date_taken = bulkData.date_taken;
    if (bulkData.location) updates.location = bulkData.location;

    if (Object.keys(updates).length > 0) {
      updateSelectedMetadata(updates);
      toast.success('¡Cambios aplicados!', 'Los metadatos se han actualizado correctamente.');
    }
  };

  const handleUpload = async (uploadAll: boolean = false) => {
    // Determine which files to upload
    let filesToUpload = uploadAll ? files : selectedFiles;
    
    // Safety check
    if (filesToUpload.length === 0) return;
    if (globalUploading) {
      toast.warning('Subida en progreso', 'Espera a que termine la subida actual.');
      return;
    }

    // Validación: cada archivo debe tener título no vacío y al menos 1 tag
    const pendingTagNames = bulkData.tags.map(t => t.name);
    const filesWithoutTags = filesToUpload.filter(f => {
      const fileTags = Array.isArray(f.tags) ? f.tags : [];
      return fileTags.length === 0 && pendingTagNames.length === 0;
    });
    const filesWithoutTitle = filesToUpload.filter(f => !f.title?.trim());

    if (filesWithoutTitle.length > 0) {
      toast.warning('Títulos en blanco', `${filesWithoutTitle.length} archivo(s) sin título.`);
      return;
    }

    if (filesWithoutTags.length > 0) {
      toast.warning('Etiquetas requeridas', `${filesWithoutTags.length} archivo(s) sin etiquetas.`);
      return;
    }

    // UX FIX: Auto-apply metadata if user forgot to click "Apply"
    const hasPendingChanges =
      bulkData.tags.length > 0 ||
      bulkData.authors.length > 0 ||
      bulkData.description ||
      bulkData.date_taken ||
      bulkData.location;

    let updatedFiles = [...filesToUpload];

    if (hasPendingChanges) {
       console.log('Auto-applying pending metadata changes before upload...');
       
       const updates: any = {};
       if (bulkData.tags.length > 0) updates.tags = bulkData.tags.map(t => t.name);
       if (bulkData.authors.length > 0) updates.authors = bulkData.authors;
       if (bulkData.description) updates.description = bulkData.description;
       if (bulkData.date_taken) updates.date_taken = bulkData.date_taken;
       if (bulkData.location) updates.location = bulkData.location;
       
       updatedFiles = updatedFiles.map(f => ({ ...f, ...updates }));
       
       if (uploadAll) {
         useIngestStore.getState().files.forEach(f => useIngestStore.getState().updateFileMetadata(f.id, updates));
       } else {
         updateSelectedMetadata(updates);
       }
    }

    // Prepare UploadFileData[] for the global store
    const uploadData: UploadFileData[] = updatedFiles.map(f => ({
      file: f.file,
      title: f.title,
      description: f.description,
      tags: Array.isArray(f.tags) ? f.tags : [],
      authors: f.authors,
      date_taken: f.date_taken,
      location: f.location,
    }));

    // Delegate upload to global store (persists across navigation)
    startUpload(uploadData, () => {
      // onComplete callback — clean up IngestStore
      toast.success('¡Archivos subidos!', `${filesToUpload.length} archivo(s) cargados exitosamente.`);
    });

    // Immediately clear the local ingest state so user can continue working
    if (uploadAll) {
      useIngestStore.getState().clearAll();
    } else {
      removeSelected();
    }
    setBulkData({ category: null, tags: [], authors: [], description: '', date_taken: '', location: '' });
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

      {/* Progress bar moved to FloatingUploadWidget in AdminLayout */}

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
              disabled={globalUploading}
              className="btn-primary w-full shadow-lg"
            >
              {globalUploading ? (
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

            <div className="space-y-1">
              <label className="label-unimar">Autores</label>
              <AuthorCombobox
                value={bulkData.authors || []}
                onChange={(authors) => setBulkData({ ...bulkData, authors })}
                placeholder="Buscar autor..."
              />
              <p className="text-[10px] text-slate-400 italic">Opcional. Quien proporcionó este archivo.</p>
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
                 <div className="flex items-center gap-2">
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
                   <span className="text-[10px] text-slate-400 normal-case font-normal capitalize-none">(Solo imágenes)</span>
                 </div>
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
              disabled={bulkData.tags.length === 0 && bulkData.authors.length === 0 && !bulkData.description && !bulkData.location && !bulkData.date_taken}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar a seleccionados
            </button>

            <hr className="border-slate-100" />

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => handleUpload(false)}
                disabled={globalUploading}
                className="btn-primary w-full shadow-lg"
              >
                {globalUploading ? (
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
