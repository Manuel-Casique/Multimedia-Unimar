'use client';

import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { IngestFile, useIngestStore } from '@/stores/useIngestStore';

const MySwal = withReactContent(Swal);

interface EditMetadataModalProps {
  file: IngestFile | null;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'evento', label: 'Evento' },
  { value: 'clase', label: 'Clase' },
  { value: 'entrevista', label: 'Entrevista' },
  { value: 'promocional', label: 'Promocional' },
  { value: 'documental', label: 'Documental' },
  { value: 'otro', label: 'Otro' },
];

export default function EditMetadataModal({ file, onClose }: EditMetadataModalProps) {
  const { updateFileMetadata } = useIngestStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    author: '',
    date_taken: '',
    location: '',
  });

  useEffect(() => {
    if (file) {
      setFormData({
        title: file.title,
        description: file.description || '',
        category: file.category || '',
        tags: file.tags.join(', '),
        author: file.author || '',
        date_taken: file.date_taken || '',
        location: file.location || '',
      });
    }
  }, [file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    updateFileMetadata(file.id, {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: formData.author,
      date_taken: formData.date_taken,
      location: formData.location,
    });

    MySwal.fire({
      icon: 'success',
      title: 'Guardado',
      text: 'Información actualizada correctamente',
      timer: 1000,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-2xl border border-white/60 backdrop-blur-xl bg-white/90 shadow-xl',
      }
    });

    onClose();
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl scale-100 opacity-100 transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-lg text-slate-800">Editar Detalles</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Preview + Basic Info */}
          <div className="flex gap-4 items-start mb-2">
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
               {file.preview ? (
                  <img src={file.preview} alt="" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
               )}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="Título del archivo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white"
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Etiquetas</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="Separa con comas..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Autor / Fotógrafo</label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="Nombre del autor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Captura</label>
              <input
                type="datetime-local"
                value={formData.date_taken ? new Date(formData.date_taken).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación</label>
             <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                placeholder="Latitud, Longitud o nombre del lugar"
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
             <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all h-24 resize-none"
                placeholder="Añade una descripción opcional..."
             />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#2D5C8B] hover:bg-[#1E4268] text-white font-medium rounded-lg shadow-lg shadow-blue-900/10 transition-all transform hover:scale-[1.02]"
            >
              Guardar Cambios
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
