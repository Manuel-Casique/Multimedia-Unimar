'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import MediaPicker from '@/components/MediaPicker';
import TagCombobox, { Tag } from '@/components/TagCombobox';
import AuthorCombobox, { Author } from '@/components/AuthorCombobox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck, faArrowLeft, faSpinner, faImage, faPhotoFilm, faTags, faMapMarkerAlt, faFolderOpen, faUsers } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import PublicationAIPanel from '@/components/PublicationAIPanel';

// Import Quill dynamically to avoid SSR issues, and register the image resize
// module inside the loader so it only ever runs client-side.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    const { default: ImageResize } = await import('quill-image-resize-module-react');
    const Quill = (await import('quill')).default;
    // Guard against double-registration (HMR)
    if (!(Quill as any).__imageResizeRegistered) {
      Quill.register('modules/imageResize', ImageResize);
      (Quill as any).__imageResizeRegistered = true;
    }
    return RQ;
  },
  {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />,
  }
) as React.ComponentType<any>;

// Import styles
import 'react-quill/dist/quill.snow.css';

export default function NewPublicationPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated, isAdmin, isEditor } = useAuthStore();
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
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<Author[]>([]);
  const [categoryId, setCategoryId] = useState<string>('');
  const [location, setLocation] = useState('');

  // Lookups
  const [categories, setCategories] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  // Toast helper
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ align: [] }],
        ['blockquote'],
        ['link', 'image'],
        ['clean'],
      ],
    },
    imageResize: {
      modules: ['Resize', 'DisplaySize'],
    },
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'align', 'blockquote', 'link', 'image',
    'width', 'height', 'style',
  ];

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) router.push('/login');
      else if (!isAdmin() && !isEditor()) {
        router.push('/publications');
        Swal.fire('Acceso Denegado', 'No tienes permisos para crear publicaciones.', 'error');
      }
    }
  }, [isAuthenticated, _hasHydrated, isAdmin, isEditor, router]);

  // Fetch categories & locations
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        setCategories(catRes.data);
        setLocations(locRes.data);
      } catch (e) { /* ignore */ }
    };
    if (isAuthenticated) fetchLookups();
  }, [isAuthenticated]);

  // Reset tags when category changes
  useEffect(() => {
    setSelectedTags([]);
  }, [categoryId]);

  const validateForm = (requireContent = false): boolean => {
    if (!title.trim()) {
      Toast.fire({ icon: 'warning', title: 'El título no puede estar vacío.' });
      return false;
    }
    if (selectedTags.length === 0) {
      Toast.fire({ icon: 'warning', title: 'Selecciona al menos una etiqueta.' });
      return false;
    }
    if (requireContent && !content.trim()) {
      Toast.fire({ icon: 'warning', title: 'El contenido no puede estar vacío para publicar.' });
      return false;
    }
    return true;
  };

  const buildPayload = (status: string) => ({
    title,
    description,
    content,
    category_id: categoryId || null,
    location: location || null,
    publication_date: publicationDate,
    thumbnail_url: thumbnailUrl,
    tags: selectedTags.map((t) => t.name),
    author_ids: selectedAuthors.map((a) => a.id),
    status,
  });

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const response = await api.post('/publications', buildPayload('draft'));
      Toast.fire({ icon: 'success', title: 'Borrador guardado correctamente.' });
      router.push(`/publications/${response.data.id}/edit`);
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: error.response?.data?.message || 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm(true)) return;
    setPublishing(true);
    try {
      await api.post('/publications', buildPayload('published'));
      Toast.fire({ icon: 'success', title: 'Tu publicación ya está visible.' });
      router.push('/publications');
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: error.response?.data?.message || 'No se pudo publicar.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleMediaSelect = (asset: any, url: string) => {
    if (mediaPickerMode === 'thumbnail') {
      setThumbnailUrl(url);
    } else {
      const imageHtml = `<p><img src="${url}" alt="${asset.title || asset.original_name}" /></p>`;
      setContent((prev) => prev + imageHtml);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user) || (!isAdmin() && !isEditor())) return null;

  const isBusy = saving || publishing;

  return (
    <AdminLayout pageTitle="Nueva Publicación" pageDescription="Crea un nuevo artículo.">
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
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
            Guardar Borrador
          </button>
          <button
            onClick={handlePublish}
            disabled={isBusy}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {publishing ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faCheck} />}
            Publicar
          </button>
        </div>
      </div>

      {/* Form + AI Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
      <div className="space-y-5">
        {/* Title + Description Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ingresa el título de tu publicación"
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent text-lg font-medium"
          />
          <label className="block text-sm font-medium text-slate-700 mt-5 mb-2">Descripción Corta</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Una breve descripción para el resumen de la publicación"
            rows={2}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent resize-none text-sm"
          />
        </div>

        {/* Category + Tags + Date + Location + Cover — unified card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FontAwesomeIcon icon={faFolderOpen} className="text-[#30669a]" />
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent text-sm bg-white"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FontAwesomeIcon icon={faTags} className="text-[#30669a]" />
                Etiquetas <span className="text-red-500">*</span>
                {selectedTags.length === 0 && (
                  <span className="ml-auto text-xs text-amber-600 font-normal bg-amber-50 px-2 py-0.5 rounded-full">
                    Mínimo 1
                  </span>
                )}
              </label>
              <TagCombobox
                value={selectedTags}
                onChange={setSelectedTags}
                categoryId={categoryId ? Number(categoryId) : undefined}
                placeholder="Buscar etiquetas..."
              />
            </div>

            {/* Autores */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FontAwesomeIcon icon={faUsers} className="text-[#30669a]" />
                Autores <span className="text-xs text-slate-400 font-normal">(opcional)</span>
              </label>
              <AuthorCombobox
                value={selectedAuthors}
                onChange={setSelectedAuthors}
                placeholder="Buscar autores..."
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fecha de Publicación</label>
              <input
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent cursor-text appearance-none"
              />
            </div>
          </div>

          {/* Location + Cover in row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-5 border-t border-slate-100">
            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#30669a]" />
                Ubicación <span className="text-xs text-slate-400 font-normal">(opcional)</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent text-sm bg-white"
              >
                <option value="">Sin ubicación</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Portada */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Imagen de Portada</label>
              <div className="flex items-center gap-3">
                {thumbnailUrl ? (
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden border border-slate-200">
                    <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setThumbnailUrl('')}
                      className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] hover:bg-red-600 flex items-center justify-center"
                    >×</button>
                  </div>
                ) : (
                  <div className="w-28 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                    <FontAwesomeIcon icon={faImage} className="text-lg" />
                  </div>
                )}
                <button
                  onClick={() => { setMediaPickerMode('thumbnail'); setShowMediaPicker(true); }}
                  className="px-3 py-2 text-xs border border-[#30669a] text-[#30669a] rounded-lg hover:bg-[#30669a]/5 transition-colors"
                >
                  <FontAwesomeIcon icon={faPhotoFilm} className="mr-1.5" />
                  Galería
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">Contenido</label>
            <button
              onClick={() => { setMediaPickerMode('content'); setShowMediaPicker(true); }}
              className="flex items-center gap-2 px-3 py-1.5 text-xs border border-[#30669a] text-[#30669a] rounded-lg hover:bg-[#30669a]/5 transition-colors"
            >
              <FontAwesomeIcon icon={faPhotoFilm} />
              Insertar Imagen
            </button>
          </div>
          <div className="quill-wrapper">
            <ReactQuill
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

      {/* AI Side Panel */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <PublicationAIPanel content={content} onApplyContent={(newContent) => setContent(newContent)} />
        </div>
      </div>
      </div>

      <MediaPicker isOpen={showMediaPicker} onClose={() => setShowMediaPicker(false)} onSelect={handleMediaSelect} />

      <style jsx global>{`
        .quill-wrapper .ql-container { min-height: 350px; font-size: 16px; }
        .quill-wrapper .ql-editor { min-height: 350px; }
        .quill-wrapper .ql-editor img { max-width: 100%; border-radius: 8px; margin: 1rem 0; cursor: pointer; }
        .quill-wrapper .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; background: #f8fafc; }
        .quill-wrapper .ql-container { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
        /* Image resize handles */
        .quill-wrapper .ql-editor img.selected,
        .quill-wrapper .ql-editor img:focus { outline: 2px solid #30669a; }
        .image-overlay__handler { background: #30669a !important; border-radius: 50% !important; }
        .image-overlay { border: 2px solid #30669a !important; }
        .image-size-overlay { background: rgba(48, 102, 154, 0.85) !important; color: #fff !important; font-size: 12px !important; border-radius: 4px !important; padding: 2px 6px !important; }
      `}</style>
    </AdminLayout>
  );
}
