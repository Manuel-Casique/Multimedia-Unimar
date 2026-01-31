'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import MediaPicker from '@/components/MediaPicker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSave, 
  faGlobe, 
  faArrowLeft,
  faSpinner,
  faImage,
  faPhotoFilm
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg"></div>
});

// Import styles
import 'react-quill/dist/quill.snow.css';

export default function NewPublicationPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'thumbnail' | 'content'>('content');
  const quillRef = useRef<any>(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [publicationDate, setPublicationDate] = useState(new Date().toISOString().split('T')[0]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // Quill modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'direction', 'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const handleOpenMediaPicker = (mode: 'thumbnail' | 'content') => {
    setMediaPickerMode(mode);
    setShowMediaPicker(true);
  };

  const handleMediaSelect = (asset: any, url: string) => {
    if (mediaPickerMode === 'thumbnail') {
      setThumbnailUrl(url);
    } else {
      // Insert image into Quill editor
      const imageHtml = `<p><img src="${url}" alt="${asset.title || asset.original_name}" /></p>`;
      setContent(prev => prev + imageHtml);
    }
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      Swal.fire('Error', 'El título es obligatorio.', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await api.post('/publications', {
        title,
        description,
        content,
        publication_date: publicationDate,
        thumbnail_url: thumbnailUrl,
        status: 'draft'
      });
      
      Swal.fire('Guardado', 'Publicación guardada como borrador.', 'success');
      router.push(`/publications/${response.data.id}/edit`);
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo guardar.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      Swal.fire('Error', 'El título es obligatorio.', 'error');
      return;
    }

    if (!content.trim()) {
      Swal.fire('Error', 'El contenido no puede estar vacío.', 'error');
      return;
    }

    setPublishing(true);
    try {
      await api.post('/publications', {
        title,
        description,
        content,
        publication_date: publicationDate,
        thumbnail_url: thumbnailUrl,
        status: 'published'
      });
      
      Swal.fire('Publicado', 'Tu publicación está ahora visible.', 'success');
      router.push('/publications');
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'No se pudo publicar.', 'error');
    } finally {
      setPublishing(false);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  return (
    <AdminLayout
      pageTitle="Nueva Publicación"
      pageDescription="Crea un nuevo artículo para tu blog."
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/publications')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver al listado
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faSave} />
            )}
            Guardar Borrador
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || publishing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {publishing ? (
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
            ) : (
              <FontAwesomeIcon icon={faGlobe} />
            )}
            Publicar
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ingresa el título de tu publicación"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent text-lg"
          />
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Descripción Corta
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una breve descripción para el resumen de la publicación"
            rows={2}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent resize-none"
          />
        </div>

        {/* Thumbnail */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Imagen de Portada
          </label>
          <div className="flex items-start gap-4">
            {thumbnailUrl ? (
              <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200">
                <img 
                  src={thumbnailUrl} 
                  alt="Thumbnail" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setThumbnailUrl('')}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="w-40 h-24 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                <FontAwesomeIcon icon={faImage} className="text-2xl" />
              </div>
            )}
            <button
              onClick={() => handleOpenMediaPicker('thumbnail')}
              className="flex items-center gap-2 px-4 py-2 border border-[#30669a] text-[#30669a] rounded-lg hover:bg-[#30669a]/5 transition-colors"
            >
              <FontAwesomeIcon icon={faPhotoFilm} />
              Seleccionar de Galería
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Fecha de Publicación
          </label>
          <input
            type="date"
            value={publicationDate}
            onChange={(e) => setPublicationDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
          />
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Contenido
            </label>
            <button
              onClick={() => handleOpenMediaPicker('content')}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-[#30669a] text-[#30669a] rounded-lg hover:bg-[#30669a]/5 transition-colors"
            >
              <FontAwesomeIcon icon={faPhotoFilm} />
              Insertar Imagen de Galería
            </button>
          </div>
          <div className="quill-wrapper">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Escribe el contenido de tu publicación aquí..."
              className="bg-white rounded-lg"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
      />

      {/* Custom styles for Quill */}
      <style jsx global>{`
        .quill-wrapper .ql-container {
          min-height: 350px;
          font-size: 16px;
        }
        .quill-wrapper .ql-editor {
          min-height: 350px;
        }
        .quill-wrapper .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .quill-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f8fafc;
        }
        .quill-wrapper .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
      `}</style>
    </AdminLayout>
  );
}
