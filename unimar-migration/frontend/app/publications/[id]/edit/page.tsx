'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import MediaPicker from '@/components/MediaPicker';
import TagCombobox, { Tag } from '@/components/TagCombobox';
import AuthorCombobox, { Author } from '@/components/AuthorCombobox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck, faArrowLeft, faSpinner, faArchive, faImage, faPhotoFilm, faTags, faMapMarkerAlt, faFolderOpen, faUsers } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import PublicationAIPanel from '@/components/PublicationAIPanel';

// Simple, crash-free dynamic import — no external resize packages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg" />,
}) as React.ComponentType<any>;

import 'react-quill/dist/quill.snow.css';

// ─── Image Size Picker overlay ────────────────────────────────────────────────
interface SizePickerProps {
  target: HTMLImageElement;
  onClose: () => void;
}
function ImageSizePicker({ target, onClose }: SizePickerProps) {
  const rect = target.getBoundingClientRect();
  const sizes = [
    { label: '25%', value: '25%' },
    { label: '50%', value: '50%' },
    { label: '75%', value: '75%' },
    { label: '100%', value: '100%' },
    { label: 'Original', value: '' },
  ];

  const apply = (value: string) => {
    target.style.width = value;
    target.style.height = 'auto';
    onClose();
  };

  return (
    <div
      className="fixed z-[9999] bg-white rounded-xl shadow-2xl border border-slate-200 p-2 flex flex-col gap-1"
      style={{ top: rect.top + window.scrollY - 8, left: rect.left + window.scrollX, transform: 'translateY(-100%)' }}
    >
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 pb-1">Tamaño de imagen</p>
      <div className="flex gap-1">
        {sizes.map((s) => (
          <button
            key={s.label}
            onClick={() => apply(s.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-[#30669a] hover:text-white text-slate-700 transition-colors"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { isAuthenticated, user, _hasHydrated, isAdmin, isEditor } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerMode, setMediaPickerMode] = useState<'thumbnail' | 'content'>('content');
  const quillRef = useRef<any>(null);

  // Image size picker state
  const [pickerTarget, setPickerTarget] = useState<HTMLImageElement | null>(null);

  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [status, setStatus] = useState('draft');
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
  }), []);

  const formats = [
    'header', 'bold', 'italic', 'underline',
    'list', 'bullet', 'align', 'blockquote', 'link', 'image',
  ];

  // Attach click listener to images inside the Quill editor for size picker
  const attachImageClickHandlers = useCallback(() => {
    const editor = document.querySelector('.quill-wrapper .ql-editor');
    if (!editor) return;
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'IMG') {
        setPickerTarget(target as HTMLImageElement);
      } else {
        setPickerTarget(null);
      }
    };
    editor.addEventListener('click', handleClick);
    return () => editor.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    const cleanup = attachImageClickHandlers();
    return cleanup;
  }, [content, attachImageClickHandlers]);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin() && !isEditor()) {
        router.push('/publications');
        Swal.fire('Acceso Denegado', 'No tienes permisos para editar publicaciones.', 'error');
      } else if (id) {
        fetchPublication();
      }
    }
  }, [isAuthenticated, _hasHydrated, isAdmin, isEditor, router, id]);

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

  const fetchPublication = async () => {
    try {
      const response = await api.get(`/publications/${id}/edit`);
      const pub = response.data;
      setTitle(pub.title);
      setDescription(pub.description || '');
      setContent(pub.content || '');
      setPublicationDate(pub.publication_date?.split('T')[0] || '');
      setStatus(pub.status);
      setThumbnailUrl(pub.thumbnail_url || '');
      setCategoryId(pub.category_id ? String(pub.category_id) : '');
      setLocation(pub.location || '');

      if (Array.isArray(pub.tags)) {
        setSelectedTags(pub.tags.map((t: any) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          category_id: t.category_id ?? null,
          category_name: t.category_name,
        })));
      }

      if (Array.isArray(pub.authors)) {
        setSelectedAuthors(pub.authors.map((a: any) => ({
          id: a.id,
          name: a.name,
        })));
      }
    } catch (error) {
      Toast.fire({ icon: 'error', title: 'No se pudo cargar la publicación.' });
      router.push('/publications');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSave = async (newStatus?: string) => {
    if (!validateForm(newStatus === 'published')) return;
    setSaving(true);
    try {
      const data: Record<string, any> = {
        title,
        description,
        content,
        category_id: categoryId || null,
        location: location || null,
        publication_date: publicationDate,
        thumbnail_url: thumbnailUrl,
        tags: selectedTags.map((t) => t.name),
        author_ids: selectedAuthors.map((a) => a.id),
      };

      if (newStatus) data.status = newStatus;

      await api.put(`/publications/${id}`, data);

      if (newStatus) setStatus(newStatus);

      const message =
        newStatus === 'published' ? 'Publicación publicada exitosamente.' :
        newStatus === 'archived' ? 'Publicación archivada.' :
        'Cambios guardados.';

      Toast.fire({ icon: 'success', title: message });
    } catch (error: any) {
      Toast.fire({ icon: 'error', title: error.response?.data?.message || 'No se pudo guardar.' });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (asset: any, url: string) => {
    if (mediaPickerMode === 'thumbnail') {
      setThumbnailUrl(url);
    } else {
      const imageHtml = `<p><img src="${url}" alt="${asset.title || asset.original_name}" style="width:100%" /></p>`;
      setContent((prev) => prev + imageHtml);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user) || (!isAdmin() && !isEditor())) return null;

  return (
    <AdminLayout pageTitle="Editar Publicación" pageDescription="Modifica tu artículo y guarda los cambios.">
      {/* Image size picker — dismisses when clicking outside */}
      {pickerTarget && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setPickerTarget(null)} />
          <ImageSizePicker target={pickerTarget} onClose={() => setPickerTarget(null)} />
        </>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => router.push('/publications')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
              Volver al listado
            </button>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                status === 'published' ? 'bg-green-100 text-green-700' :
                status === 'archived' ? 'bg-slate-100 text-slate-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {status === 'published' ? 'Publicado' : status === 'archived' ? 'Archivado' : 'Borrador'}
              </span>

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {saving ? <FontAwesomeIcon icon={faSpinner} className="animate-spin" /> : <FontAwesomeIcon icon={faSave} />}
                Guardar
              </button>

              {status === 'draft' && (
                <button
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faCheck} />
                  Publicar
                </button>
              )}

              {status === 'published' && (
                <button
                  onClick={() => handleSave('archived')}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faArchive} />
                  Archivar
                </button>
              )}
            </div>
          </div>

          {/* Form + AI Panel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Form */}
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
                    onChange={(e) => { setCategoryId(e.target.value); setSelectedTags([]); }}
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

              {/* Location + Cover */}
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
              <p className="text-[11px] text-slate-400 mb-2">💡 Haz clic en una imagen insertada para cambiar su tamaño.</p>
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
            .quill-wrapper .ql-editor img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; cursor: pointer; transition: outline 0.15s; }
            .quill-wrapper .ql-editor img:hover { outline: 2px solid #30669a; outline-offset: 2px; }
            .quill-wrapper .ql-toolbar { border-top-left-radius: 8px; border-top-right-radius: 8px; background: #f8fafc; }
            .quill-wrapper .ql-container { border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; }
          `}</style>
        </>
      )}
    </AdminLayout>
  );
}
