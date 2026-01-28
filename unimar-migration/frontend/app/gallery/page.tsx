'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface MediaAsset {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string[];
  file_url: string;
  thumbnail_url: string | null;
  mime_type: string;
  file_size: number;
  formatted_size: string;
  created_at: string;
  author?: string;
  location?: string;
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset | null>(null);

  const CATEGORIES = [
    { value: 'noticia', label: 'Noticia' },
    { value: 'evento', label: 'Evento' },
    { value: 'academico', label: 'Académico' },
    { value: 'deportivo', label: 'Deportivo' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'institucional', label: 'Institucional' },
    { value: 'otro', label: 'Otro' },
  ];

  // Group media by date
  const groupedMedia = useMemo(() => {
    // Sort by date descending first
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

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchTerm) params.q = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (authorFilter) params.author = authorFilter;
      if (tagsFilter) params.tags = tagsFilter;
      if (locationFilter) params.location = locationFilter;

      const response = await api.get('/media', { params });
      setMedia(response.data.data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening viewer
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const openViewer = (item: MediaAsset) => {
    setSelectedMedia(item);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setSelectedMedia(null);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await MySwal.fire({
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
        await api.delete('/media/batch', { data: { ids: selectedIds } });
        MySwal.fire({ icon: 'success', title: 'Eliminado', timer: 1500, showConfirmButton: false });
        setSelectedIds([]);
        fetchMedia();
      } catch (error) {
        console.error('Error deleting media:', error);
        MySwal.fire('Error', 'No se pudieron eliminar los archivos.', 'error');
      }
    }
  };

  // Get thumbnail or file URL with proper base
  const getMediaUrl = (item: MediaAsset) => {
    const url = item.thumbnail_url || item.file_url;
    if (!url) return '/placeholder-image.png';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
  };

  if (!_hasHydrated) return null;

  return (
    <AdminLayout 
      pageTitle="Galería Multimedia" 
      pageDescription="Administra y visualiza todos los archivos multimedia"
    >
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-100">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
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
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Autor</label>
            <input
              type="text"
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              placeholder="Nombre..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
            >
              <option value="">Todas</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Etiquetas</label>
            <input
              type="text"
              value={tagsFilter}
              onChange={(e) => setTagsFilter(e.target.value)}
              placeholder="ej: evento"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Ubicación</label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Lugar..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#30669a]/20"
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

      {/* Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[#30669a]/10 rounded-lg">
          <span className="text-sm font-medium text-[#30669a]">{selectedIds.length} seleccionado(s)</span>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
          <button
            onClick={() => setSelectedIds([])}
            className="text-sm text-slate-600 hover:text-slate-800"
          >
            Cancelar selección
          </button>
        </div>
      )}

      {/* Content - Google Photos style grouped by date */}
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
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedMedia).map(([date, items]) => (
            <div key={date}>
              {/* Date Header */}
              <h2 className="text-lg font-semibold text-gray-700 mb-4 capitalize">{date}</h2>
              
              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300"
                    onClick={() => openViewer(item)}
                  >
                    {/* Selection checkbox */}
                    <div 
                      onClick={(e) => toggleSelect(item.id, e)}
                      className={`
                        absolute top-2 left-2 z-20 w-6 h-6 rounded-full border-2 bg-white/90 flex items-center justify-center transition-all cursor-pointer
                        ${selectedIds.includes(item.id) ? 'border-[#30669a] bg-[#30669a]' : 'border-white opacity-0 group-hover:opacity-100'}
                      `}
                    >
                      {selectedIds.includes(item.id) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>

                    {/* Media thumbnail */}
                    {item.mime_type.startsWith('image/') ? (
                      <img 
                        src={getMediaUrl(item)} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.png';
                        }}
                      />
                    ) : item.mime_type.startsWith('video/') ? (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                      </div>
                    )}

                    {/* Hover overlay with metadata */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                      <h3 className="text-white text-sm font-medium truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {item.category && (
                          <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded">{item.category}</span>
                        )}
                        <span className="text-xs text-white/60">{item.formatted_size}</span>
                      </div>
                      {item.author && (
                        <p className="text-xs text-white/60 mt-1 truncate">Por: {item.author}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      {viewerOpen && selectedMedia && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
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

          {/* Media content */}
          <div 
            className="max-w-5xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.mime_type.startsWith('image/') ? (
              <img 
                src={getMediaUrl(selectedMedia)} 
                alt={selectedMedia.title}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            ) : selectedMedia.mime_type.startsWith('video/') ? (
              <video 
                src={getMediaUrl(selectedMedia)} 
                controls 
                autoPlay
                className="max-w-full max-h-[70vh] rounded-lg"
              />
            ) : selectedMedia.mime_type.startsWith('audio/') ? (
              <div className="bg-white/10 p-8 rounded-xl flex flex-col items-center">
                <svg className="w-24 h-24 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <audio src={getMediaUrl(selectedMedia)} controls autoPlay className="w-80" />
              </div>
            ) : null}

            {/* Info panel */}
            <div className="mt-6 text-white text-center max-w-lg">
              <h2 className="text-xl font-semibold">{selectedMedia.title}</h2>
              {selectedMedia.description && (
                <p className="text-white/70 mt-2 text-sm">{selectedMedia.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-white/60">
                {selectedMedia.category && <span className="bg-white/20 px-2 py-1 rounded">{selectedMedia.category}</span>}
                <span>{selectedMedia.formatted_size}</span>
                <span>{new Date(selectedMedia.created_at).toLocaleDateString('es-VE')}</span>
                {selectedMedia.author && <span>Por: {selectedMedia.author}</span>}
                {selectedMedia.location && <span>📍 {selectedMedia.location}</span>}
              </div>
              {selectedMedia.tags && selectedMedia.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-3">
                  {selectedMedia.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-[#30669a]/50 text-white px-2 py-1 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
