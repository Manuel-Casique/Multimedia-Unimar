'use client';

import { useState } from 'react';
import { useIngestStore } from '@/stores/useIngestStore';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const CATEGORIES = [
  { value: '', label: 'Seleccionar categoría' },
  { value: 'noticia', label: 'Noticia' },
  { value: 'evento', label: 'Evento' },
  { value: 'academico', label: 'Académico' },
  { value: 'deportivo', label: 'Deportivo' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'otro', label: 'Otro' },
];

export default function IngestSidebar() {
  const { files, selectedIds, updateSelectedMetadata, removeSelected, isUploading } = useIngestStore();
  
  const [bulkData, setBulkData] = useState<{
    category: string;
    tags: string;
    description?: string;
    author?: string;
    date_taken?: string;
    location?: string;
  }>({
    category: '',
    tags: '',
    description: '',
    author: '',
    date_taken: '',
    location: '',
  });

  const selectedFiles = files.filter((f) => selectedIds.includes(f.id));
  const hasSelection = selectedFiles.length > 0;

  const handleApplyToSelected = () => {
    const updates: any = {};
    
    if (bulkData.category) updates.category = bulkData.category;
    if (bulkData.tags.trim()) updates.tags = bulkData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (bulkData.description) updates.description = bulkData.description;
    if (bulkData.author) updates.author = bulkData.author;
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

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      useIngestStore.getState().setUploading(true);
      
      const formData = new FormData();
      
      // Append files
      selectedFiles.forEach((file) => {
        formData.append('files[]', file.file);
      });

      // Append metadata for each file in order
      const filesMetadata = selectedFiles.map(file => ({
        title: file.title,
        description: file.description,
        category: file.category,
        tags: file.tags
      }));
      
      formData.append('file_metadata', JSON.stringify(filesMetadata));

      await api.post('/ingest/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Success feedback and state cleanup
      MySwal.fire({
        icon: 'success',
        title: '¡Archivos subidos!',
        text: 'Tus archivos se han cargado exitosamente.',
        confirmButtonText: 'Genial',
        confirmButtonColor: '#0b3d91',
        customClass: {
          popup: 'rounded-2xl border border-unimar-surface shadow-xl',
        }
      });
      
      removeSelected(); // Remove uploaded files from the list
      setBulkData({ category: '', tags: '' }); // Reset form
      
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
           Edición Masiva
        </h3>
        <p className="text-white/80 text-xs mt-1 font-medium">
          {hasSelection
            ? `${selectedFiles.length} archivo${selectedFiles.length !== 1 ? 's' : ''} seleccionado${selectedFiles.length !== 1 ? 's' : ''}`
            : 'Selecciona archivos para editar'
          }
        </p>
      </div>

      {/* Body - White background */}
      <div className="p-5 space-y-5 bg-white">
        {!hasSelection ? (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">Selecciona uno o más archivos para aplicar metadatos.</p>
          </div>
        ) : (
          <>
            {/* Category */}
            <div className="space-y-2">
              <label className="label-unimar">
                Categoría
              </label>
              <select
                value={bulkData.category}
                onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                className="input-unimar cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="label-unimar">
                Etiquetas
              </label>
              <input
                type="text"
                value={bulkData.tags}
                onChange={(e) => setBulkData({ ...bulkData, tags: e.target.value })}
                placeholder="ej: graduación, 2026, evento"
                className="input-unimar"
              />
              <p className="text-xs text-slate-400">Separadas por comas</p>
            </div>

            {/* Nueva Metadata Bulk */}
            <div className="grid grid-cols-2 gap-3">
               <div className="space-y-2">
                  <label className="label-unimar">Autor</label>
                  <input
                    type="text"
                    value={bulkData.author || ''}
                    onChange={(e) => setBulkData({ ...bulkData, author: e.target.value })}
                    className="input-unimar"
                    placeholder="Fotógrafo..."
                  />
               </div>
               <div className="space-y-2">
                  <label className="label-unimar">Fecha</label>
                  <input
                    type="datetime-local"
                    value={bulkData.date_taken ? new Date(bulkData.date_taken).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setBulkData({ ...bulkData, date_taken: e.target.value })}
                    className="input-unimar"
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="label-unimar">Ubicación</label>
               <input
                 type="text"
                 value={bulkData.location || ''}
                 onChange={(e) => setBulkData({ ...bulkData, location: e.target.value })}
                 className="input-unimar"
                 placeholder="Lugar..."
               />
            </div>

            <div className="space-y-2">
               <label className="label-unimar">Descripción Masiva</label>
               <textarea
                 value={bulkData.description || ''}
                 onChange={(e) => setBulkData({ ...bulkData, description: e.target.value })}
                 className="input-unimar h-20 resize-none"
                 placeholder="Se aplicará a todos (cuidado)..."
               />
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyToSelected}
              disabled={!bulkData.category && !bulkData.tags.trim() && !bulkData.description && !bulkData.author && !bulkData.location && !bulkData.date_taken}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aplicar a seleccionados
            </button>

            <hr className="border-slate-100" />

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={handleUpload}
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
                    Subir Archivos
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
