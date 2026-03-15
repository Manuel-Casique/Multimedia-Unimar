'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast, { Swal } from '@/lib/toast';
import TagCombobox, { Tag } from '@/components/TagCombobox';
import LocationCombobox from '@/components/LocationCombobox';
import CategoryCombobox, { Category } from '@/components/CategoryCombobox';
import AuthorCombobox, { Author } from '@/components/AuthorCombobox';

interface MediaAsset {
  id: number;
  title: string;
  description: string;
  tags: Tag[];
  authors?: Author[];
  file_url: string;
  thumbnail_url: string | null;
  mime_type: string;
  file_size: number;
  formatted_size: string;
  created_at: string;
  location?: string;
  width?: number;
  height?: number;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Helper to group media by date
function groupByDate(media: MediaAsset[]): { [key: string]: MediaAsset[] } {
  const groups: { [key: string]: MediaAsset[] } = {};
  
  media.forEach(item => {
    const date = new Date(item.created_at);
    const key = date.toLocaleDateString('es-VE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  
  return groups;
}

export default function GalleryPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for features
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tagsFilter, setTagsFilter] = useState<Tag[]>([]);
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [categoriesFilter, setCategoriesFilter] = useState<Category[]>([]);
  const [authorsFilter, setAuthorsFilter] = useState<Author[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [orientationFilter, setOrientationFilter] = useState<string>('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<MediaAsset>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user, isAdmin } = useAuthStore();

  // Group media by date
  const groupedMedia = useMemo(() => {
    const sorted = [...media].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return groupByDate(sorted);
  }, [media]);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && isAuthenticated) {
      fetchMedia();
    }
  }, [isAuthenticated, _hasHydrated, router]); 

  const fetchMedia = async (page: number = 1) => {
    try {
      setLoading(true);
      const params: any = { page };
      if (searchTerm) params.q = searchTerm;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (tagsFilter.length > 0) params.tags = tagsFilter.map(t => t.name);
      if (locationFilter.length > 0) params.locations = locationFilter;
      if (categoriesFilter.length > 0) params.categories = categoriesFilter.map(c => c.id);
      if (authorsFilter.length > 0) params.authors = authorsFilter.map(a => a.id);
      if (typeFilter && typeFilter !== 'all') params.type = typeFilter;
      if (orientationFilter && orientationFilter !== 'all') params.orientation = orientationFilter;

      const response = await api.get('/media', { params });
      setMedia(response.data.data || []);
      setCurrentPage(response.data.current_page || 1);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMedia(1);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchMedia(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening viewer
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const openViewer = (item: MediaAsset) => {
    setSelectedMedia(item);
    setEditData({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      // Mapear tags: si tienen id real del backend úsarlo, si son strings legacy usar id=0
      tags: Array.isArray(item.tags)
        ? item.tags.map((t: any) =>
            typeof t === 'string'
              ? { id: 0, name: t, slug: t.toLowerCase().replace(/\s+/g, '-'), category_id: null }
              : t
          )
        : [],
      authors: item.authors || [],
    } as any);
    setIsEditing(false);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedMedia) return;
    setIsSaving(true);
    try {
      // Enviar tags como array de nombres
      const tagsSource: any = editData.tags;
      const finalTags: string[] = Array.isArray(tagsSource)
        ? tagsSource.map((t: any) => (typeof t === 'string' ? t : t.name))
        : [];

      // Enviar authors como array de ids
      const authorsSource: any = editData.authors;
      const finalAuthors: number[] = Array.isArray(authorsSource)
        ? authorsSource.map((a: any) => a.id)
        : [];

      const response = await api.put(`/media/${selectedMedia.id}`, {
        ...editData,
        tags: finalTags,
        authors: finalAuthors
      });

      // Update local state
      const updatedMedia = response.data.media;
      setMedia(prev => prev.map(m => m.id === updatedMedia.id ? updatedMedia : m));
      setSelectedMedia(updatedMedia);
      
      toast.success('Guardado', 'Los cambios se han guardado correctamente.');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving media:', error);
      toast.error('Error', error.response?.data?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const fileToBase64Url = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Genera título y descripción con IA para el asset seleccionado en la galería
  const generateAIMetadata = async () => {
    if (!selectedMedia) return;
    setIsAiLoading(true);
    try {
      const response = await api.post(`/ai/media/${selectedMedia.id}/metadata`);

      if (response.data) {
        setEditData(prev => ({
          ...prev,
          ...(response.data.title ? { title: response.data.title } : {}),
          ...(response.data.description ? { description: response.data.description } : {}),
        }));

        toast.success('Análisis IA', 'Gemini generó título y descripción para este archivo.');
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error('Error de IA', 'Nuestra IA se encuentra ocupada o hubo un problema al analizar la imagen.');
    } finally {
      setIsAiLoading(false);
    }
  };


  // Get flat list of all media for navigation
  const flatMedia = useMemo(() => {
    return Object.values(groupedMedia).flat();
  }, [groupedMedia]);

  // Navigation functions for modal
  const navigateMedia = (direction: 'prev' | 'next') => {
    if (!selectedMedia || flatMedia.length === 0) return;
    const currentIndex = flatMedia.findIndex(m => m.id === selectedMedia.id);
    if (currentIndex === -1) return;
    
    let newIndex: number;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? flatMedia.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === flatMedia.length - 1 ? 0 : currentIndex + 1;
    }
    setSelectedMedia(flatMedia[newIndex]);
  };

  // Get format from mime type
  const getFormatLabel = (mimeType: string) => {
    const parts = mimeType.split('/');
    return parts[1]?.toUpperCase() || mimeType;
  };

  // Get orientation string
  const getOrientation = (width?: number, height?: number) => {
    if (!width || !height) return null;
    if (width > height) return 'Horizontal';
    if (width < height) return 'Vertical';
    return 'Cuadrado';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setTagsFilter([]);
    setLocationFilter([]);
    setCategoriesFilter([]);
    setAuthorsFilter([]);
    setTypeFilter('all');
    setOrientationFilter('all');
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminarán ${selectedIds.length} archivo(s). Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        console.log('Deleting media IDs:', selectedIds);
        const response = await api.delete('/media/batch', { data: { ids: selectedIds } });
        console.log('Delete response:', response.data);
        
        toast.success('Eliminado', response.data.message);
        setSelectedIds([]);
        fetchMedia();
      } catch (error: any) {
        console.error('Error deleting media:', error);
        console.error('Error response:', error.response);
        
        const errorMessage = error.response?.data?.message 
          || error.response?.data?.errors 
          || 'No se pudieron eliminar los archivos.';
        
        toast.error('Error', typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      }
    }
  };

  // Get thumbnail or file URL with proper base
  const getMediaUrl = (item: MediaAsset, forceFileUrl: boolean = false) => {
    const url = forceFileUrl ? item.file_url : (item.thumbnail_url || item.file_url);
    if (!url) return '/placeholder-image.png';
    if (url.startsWith('http')) return url;
    // Construir URL base del backend correctamente
    const backendBase = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') 
      : 'http://localhost:8000';
    // Asegurar que la URL no tenga doble slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendBase}${cleanUrl}`;
  };

  if (!_hasHydrated) return null;

  return (
    <AdminLayout 
      pageTitle="Galería Multimedia" 
      pageDescription="Administra y visualiza todos los archivos multimedia"
    >
      {/* Filters + Results fused card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 mb-4">
        {/* Search bar row */}
        <div className="p-4 border-b border-slate-100">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, descripción..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 text-white font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: '#30669a' }}
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2.5 text-slate-600 font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Limpiar
            </button>
          </form>
        </div>

        {/* Filters row */}
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Categorías</label>
              <CategoryCombobox
                value={categoriesFilter}
                onChange={setCategoriesFilter}
                placeholder="Categoría..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 cursor-pointer"
              >
                <option value="all">Todos los Tipos</option>
                <option value="image">Imágenes</option>
                <option value="video">Videos</option>
                <option value="audio">Audios</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Orientación</label>
              <select
                value={orientationFilter}
                onChange={(e) => setOrientationFilter(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 cursor-pointer"
              >
                <option value="all">Cualquiera</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
                <option value="square">Cuadrada</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Etiquetas</label>
              <TagCombobox
                value={tagsFilter}
                onChange={setTagsFilter}
                placeholder="Etiqueta..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
              <LocationCombobox
                value={locationFilter}
                onChange={setLocationFilter}
                multiple
                placeholder="Ubicación..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Autor</label>
              <AuthorCombobox
                value={authorsFilter}
                onChange={setAuthorsFilter}
                placeholder="Autor..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
              />
            </div>
          </div>
        </div>

        {/* Selection action bar (inline, inside card) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#30669a]/5 border-b border-[#30669a]/20">
            <span className="text-sm font-medium text-[#30669a]">{selectedIds.length} seleccionado(s)</span>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors text-xs font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Eliminar
            </button>
            <button onClick={() => setSelectedIds([])} className="text-xs text-slate-500 hover:text-slate-800">
              Cancelar
            </button>
            <span className="ml-auto text-xs text-slate-400">{media.length} archivo(s) en total</span>
          </div>
        )}

        {/* Table header / View Toggle (shown even when not selecting) */}
        {selectedIds.length === 0 && (
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 bg-slate-50/40">
            <span className="text-xs font-medium text-slate-500">{media.length} archivo(s)</span>
            
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-lg shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-[#30669a] shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                title="Vista en cuadrícula"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-[#30669a] shadow-inner' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                title="Vista en lista"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium">Cargando biblioteca...</p>
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-600">No se encontraron archivos</h3>
            <p className="text-sm">Sube contenido nuevo o ajusta tus filtros.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="p-4 space-y-8 bg-slate-50">
            {Object.entries(groupedMedia).map(([date, items]) => (
              <div key={date}>
                {/* Date Header */}
                <h2 className="text-sm font-semibold text-slate-700 mb-3 capitalize flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {date}
                </h2>
                
                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                  {items.map((item) => (
                    <div 
                      key={item.id} 
                      className={`
                        group relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                        border border-slate-200 hover:border-[#30669a]/50
                        shadow-sm hover:shadow-md
                        ${selectedIds.includes(item.id) ? 'ring-2 ring-[#30669a] ring-offset-2' : ''}
                      `}
                      onClick={() => openViewer(item)}
                    >
                      {/* Selection checkbox */}
                      <div 
                        onClick={(e) => toggleSelect(item.id, e)}
                        className={`
                          absolute top-2 left-2 z-20 w-6 h-6 rounded-md border-2 bg-white flex items-center justify-center transition-all cursor-pointer shadow-sm
                          ${selectedIds.includes(item.id) ? 'border-[#30669a] bg-[#30669a]' : 'border-slate-300 opacity-0 group-hover:opacity-100 hover:border-[#30669a]'}
                        `}
                      >
                        {selectedIds.includes(item.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {/* Media Container (1:1 Ratio via padding hack) */}
                      <div className="relative w-full pt-[100%] bg-slate-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center p-1">
                          {item.mime_type.startsWith('image/') ? (
                            <img 
                              src={getMediaUrl(item)} 
                              alt={item.title} 
                              className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                              }}
                            />
                          ) : item.mime_type.startsWith('video/') ? (
                            <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center relative overflow-hidden group/video">
                              {item.thumbnail_url ? (
                                <img 
                                  src={getMediaUrl({ ...item, file_url: item.thumbnail_url })} 
                                  alt={item.title}
                                  className="absolute inset-0 w-full h-full object-cover opacity-70 transition-transform duration-500 group-hover/video:scale-105"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : null}
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-10 border border-white/30 transition-transform duration-300 group-hover/video:scale-110">
                                <svg className="w-5 h-5 text-white ml-1 shadow-sm" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-slate-100 rounded-lg flex flex-col items-center justify-center border border-slate-200/50">
                              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 text-[#30669a]">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-slate-400">AUDIO</span>
                            </div>
                          )}
                        </div>

                        {/* Format Icon Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-white font-medium flex items-center gap-1 shadow-sm">
                          {item.mime_type.startsWith('video/') && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                          {getFormatLabel(item.mime_type)}
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className="p-2.5 bg-white border-t border-slate-100">
                        <h3 className="text-xs font-semibold text-slate-800 truncate mb-1" title={item.title}>{item.title}</h3>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="truncate max-w-[60%]">
                            {item.authors && item.authors.length > 0 ? item.authors[0].name : (item.user?.first_name || 'Desconocido')}
                          </span>
                          <span className="shrink-0">{item.formatted_size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
        /* List View */
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Seleccionar</span>
                </th>
                <th className="w-16 px-2 py-3 text-left text-xs font-semibold text-slate-600">Vista</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Título</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden sm:table-cell">Tamaño</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden md:table-cell">Autor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flatMedia.map((item) => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(item.id) ? 'bg-[#30669a]/5' : ''}`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => toggleSelect(item.id, e as any)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedIds.includes(item.id) 
                          ? 'border-[#30669a] bg-[#30669a]' 
                          : 'border-slate-300 hover:border-[#30669a]'
                      }`}
                    >
                      {selectedIds.includes(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-2 py-3">
                    <div 
                      className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-[#30669a] hover:shadow-sm transition-all shadow-sm"
                      onClick={() => openViewer(item)}
                    >
                      {item.mime_type.startsWith('image/') ? (
                        <img 
                          src={getMediaUrl(item)} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                      ) : item.mime_type.startsWith('video/') ? (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center relative overflow-hidden group/videoList">
                          {item.thumbnail_url ? (
                            <img 
                              src={getMediaUrl({ ...item, file_url: item.thumbnail_url })} 
                              alt={item.title}
                              className="absolute inset-0 w-full h-full object-cover opacity-70"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : null}
                          <svg className="w-5 h-5 text-white z-10 drop-shadow-md relative" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#30669a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div 
                      className="cursor-pointer"
                      onClick={() => openViewer(item)}
                    >
                      <p className="text-sm font-semibold text-slate-800 truncate max-w-[200px] hover:text-[#30669a]">{item.title}</p>
                      <p className="text-xs text-slate-500">{getFormatLabel(item.mime_type)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-xs">{item.formatted_size}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-slate-700">
                      {item.authors && item.authors.length > 0 ? item.authors[0].name : (item.user ? `${item.user.first_name} ${item.user.last_name}` : 'Desconocido')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-sm text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openViewer(item)}
                        className="p-1.5 text-slate-400 hover:text-[#30669a] hover:bg-[#30669a]/10 rounded-lg transition-colors"
                        title="Ver"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <a
                        href={getMediaUrl(item, true)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && media.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Mostrando página <span className="font-semibold text-slate-700">{currentPage}</span> de <span className="font-semibold text-slate-700">{totalPages}</span>
            <span className="ml-2 text-slate-400">({totalItems} archivos en total)</span>
          </p>
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Primera"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
            {/* Prev */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-[#30669a] text-white shadow-md'
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            {/* Next */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
            {/* Last */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Última"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
      </div>

      {/* Media Viewer Modal - Horizontal Layout with Metadata Panel */}
      {viewerOpen && selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white z-50"
            onClick={closeViewer}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {flatMedia.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateMedia('prev'); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all z-50"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); navigateMedia('next'); }}
                className="absolute right-20 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white/80 hover:bg-black/70 hover:text-white transition-all z-50"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white/80 text-sm">
                {flatMedia.findIndex(m => m.id === selectedMedia.id) + 1} / {flatMedia.length}
              </div>
            </>
          )}

          {/* Main content - Horizontal layout */}
          <div 
            className="flex flex-col lg:flex-row gap-6 max-w-7xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Media content */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              {selectedMedia.mime_type.startsWith('image/') ? (
                <img 
                  src={getMediaUrl(selectedMedia, true)} 
                  alt={selectedMedia.title}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg"
                />
              ) : selectedMedia.mime_type.startsWith('video/') ? (
                <video 
                  src={getMediaUrl(selectedMedia, true)} 
                  controls 
                  autoPlay
                  className="max-w-full max-h-[80vh] rounded-lg"
                />
              ) : selectedMedia.mime_type.startsWith('audio/') ? (
                <div className="bg-white/10 p-8 rounded-xl flex flex-col items-center">
                  <svg className="w-24 h-24 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <audio src={getMediaUrl(selectedMedia, true)} controls autoPlay className="w-80" />
                </div>
              ) : null}
            </div>

            {/* Right: Metadata panel */}
            <div className="lg:w-80 w-full bg-slate-900 rounded-xl p-5 overflow-y-auto max-h-[80vh] flex-shrink-0 flex flex-col">
              
              {/* Header with Edit Toggle */}
              <div className="flex justify-between items-start mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-lg font-bold focus:outline-none focus:border-[#30669a]"
                    placeholder="Título del archivo"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-white pr-2 truncate" title={selectedMedia.title}>
                    {selectedMedia.title}
                  </h2>
                )}

                {isAdmin() && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex-shrink-0"
                    title="Editar metadatos"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Description con botón Auto IA */}
              {isEditing ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50">Descripción</span>
                    {selectedMedia.mime_type.startsWith('image/') && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={generateAIMetadata}
                          disabled={isAiLoading}
                          className="text-[10px] flex items-center gap-1 text-purple-300 hover:text-purple-200 bg-purple-900/40 hover:bg-purple-800/60 px-2 py-1 rounded transition-colors disabled:opacity-50"
                          title="Generar título y descripción con IA"
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
                        <span className="text-[9px] text-white/40">(Solo imágenes)</span>
                      </div>
                    )}
                  </div>
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                    className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#30669a] min-h-[80px]"
                    placeholder="Descripción..."
                  />
                </div>
              ) : selectedMedia.description ? (
                <p className="text-white/70 text-sm mb-4 leading-relaxed">{selectedMedia.description}</p>
              ) : null}

              {/* Metadata grid */}
              <div className="space-y-3 flex-1">

                {/* Location */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/50 mb-1">Ubicación</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.location}
                        onChange={(e) => setEditData({...editData, location: e.target.value})}
                        className="w-full bg-slate-800 text-white border border-slate-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-[#30669a]"
                      />
                    ) : (
                      <p className="text-sm text-white font-medium">{selectedMedia.location || 'Sin ubicación'}</p>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Fecha de carga</p>
                    <p className="text-sm text-white font-medium">
                      {new Date(selectedMedia.created_at).toLocaleDateString('es-VE', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-white/50">Subido por</p>
                    <p className="text-sm text-white font-medium">
                      {selectedMedia.user ? `${selectedMedia.user.first_name} ${selectedMedia.user.last_name}` : 'Desconocido'}
                    </p>
                  </div>
                </div>

                <hr className="border-white/10 my-4" />

                {/* Technical info */}
                {!isEditing && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-white/50">Formato</p>
                      <p className="text-sm text-white font-medium">{getFormatLabel(selectedMedia.mime_type)}</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-white/50">Tamaño</p>
                      <p className="text-sm text-white font-medium">{selectedMedia.formatted_size}</p>
                    </div>
                    {selectedMedia.width && selectedMedia.height && (
                      <>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50">Dimensiones</p>
                          <p className="text-sm text-white font-medium">{selectedMedia.width}×{selectedMedia.height}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-xs text-white/50">Orientación</p>
                          <p className="text-sm text-white font-medium">{getOrientation(selectedMedia.width, selectedMedia.height)}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tags */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/50">Etiquetas</p>
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <TagCombobox
                        value={Array.isArray(editData.tags) ? (editData.tags as any) : []}
                        onChange={(tags) => setEditData({ ...editData, tags: tags as any })}
                        placeholder="Buscar etiqueta..."
                        darkMode
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.tags && selectedMedia.tags.length > 0 ? (
                        selectedMedia.tags.map((tag: any, i) => (
                          <span key={i} className="text-xs bg-[#30669a]/50 text-white px-2.5 py-1 rounded-full">
                            {typeof tag === 'string' ? tag : tag.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/30 italic">Sin etiquetas</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Categorías (derived from tags) */}
                {(() => {
                  const cats = selectedMedia.tags
                    ?.map((t: any) => typeof t === 'object' && t.category ? t.category : null)
                    .filter(Boolean)
                    .filter((c: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.id === c.id) === i);
                  if (!cats || cats.length === 0) return null;
                  return (
                    <div className="mt-4">
                      <p className="text-xs text-white/50 mb-2">Categorías</p>
                      <div className="flex flex-wrap gap-2">
                        {cats.map((cat: any) => (
                          <span key={cat.id} className="text-xs bg-purple-500/30 text-purple-200 px-2.5 py-1 rounded-full border border-purple-400/20">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Autores */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-white/50">Autores</p>
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <AuthorCombobox
                        value={Array.isArray(editData.authors) ? (editData.authors as any) : []}
                        onChange={(authors) => setEditData({ ...editData, authors: authors as any })}
                        placeholder="Buscar autor..."
                        darkMode
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedMedia.authors && selectedMedia.authors.length > 0 ? (
                        selectedMedia.authors.map((author: any, i) => (
                          <span key={i} className="text-xs bg-[#30669a]/50 text-white px-2.5 py-1 rounded-full border border-white/10">
                            {author.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/30 italic">Sin autores</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons at the bottom */}
              <div className="mt-6 pt-4 border-t border-white/10">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 py-2.5 bg-[#30669a] hover:bg-[#255080] text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      Guardar
                    </button>
                  </div>
                ) : (
                  <a
                    href={getMediaUrl(selectedMedia)}
                    download={selectedMedia.title || 'archivo'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#30669a] hover:bg-[#255080] text-white font-medium rounded-xl transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar archivo
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
