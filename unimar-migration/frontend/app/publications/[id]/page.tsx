'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faCalendar, faTags, faMapMarkerAlt, faFolderOpen, faEye } from '@fortawesome/free-solid-svg-icons';

export default function ViewPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { isAuthenticated, _hasHydrated, isAdmin, isEditor } = useAuthStore();
  const [publication, setPublication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchPublication();
  }, [_hasHydrated, isAuthenticated, id]);

  const fetchPublication = async () => {
    try {
      const response = await api.get(`/publications/${id}/edit`);
      setPublication(response.data);
    } catch {
      router.push('/publications');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel: Record<string, { text: string; color: string }> = {
    draft: { text: 'Borrador', color: 'bg-amber-100 text-amber-800' },
    published: { text: 'Publicado', color: 'bg-green-100 text-green-800' },
    archived: { text: 'Archivado', color: 'bg-slate-100 text-slate-600' },
  };

  if (!_hasHydrated || loading) {
    return (
      <AdminLayout pageTitle="Cargando..." pageDescription="Obteniendo datos de la publicación.">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!publication) return null;

  const st = statusLabel[publication.status] || statusLabel.draft;

  return (
    <AdminLayout pageTitle={publication.title} pageDescription="Vista previa de la publicación seleccionada.">
      {/* Top bar */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
        <button
          onClick={() => router.push('/publications')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver al listado
        </button>

        {(isAdmin() || isEditor()) && (
          <button
            onClick={() => router.push(`/publications/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#30669a] text-white rounded-lg hover:bg-[#275580] transition-colors"
          >
            <FontAwesomeIcon icon={faEdit} />
            Editar
          </button>
        )}
      </div>

      {/* Hero / Header */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        {publication.thumbnail_url && (
          <div className="w-full h-56 md:h-72 overflow-hidden">
            <img
              src={publication.thumbnail_url}
              alt={publication.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Status badge */}
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
              {st.text}
            </span>
            {publication.views_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <FontAwesomeIcon icon={faEye} />
                {publication.views_count} vistas
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {publication.title}
          </h1>

          {/* Description */}
          {publication.description && (
            <p className="text-slate-500 text-base mb-4">{publication.description}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            {publication.publication_date && (
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendar} className="text-[#30669a]" />
                {new Date(publication.publication_date).toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            {publication.category && (
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faFolderOpen} className="text-[#30669a]" />
                {publication.category.name}
              </span>
            )}
            {publication.location && (
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[#30669a]" />
                {publication.location}
              </span>
            )}
          </div>

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <FontAwesomeIcon icon={faTags} className="text-[#30669a] mt-0.5" />
              {publication.tags.map((tag: any) => (
                <span key={tag.id} className="bg-[#30669a]/10 text-[#30669a] text-xs font-medium px-2.5 py-1 rounded-full">
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content body */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div
          className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-[#30669a] prose-img:rounded-lg prose-img:mx-auto"
          dangerouslySetInnerHTML={{ __html: publication.content || '<p class="text-slate-400 italic">Sin contenido.</p>' }}
        />
      </div>

      <style jsx global>{`
        .prose img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        .prose h1, .prose h2, .prose h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
        .prose p { margin: 0.75rem 0; line-height: 1.75; }
        .prose ul, .prose ol { padding-left: 1.5rem; }
        .prose blockquote { border-left: 3px solid #30669a; padding-left: 1rem; color: #64748b; font-style: italic; }
      `}</style>
    </AdminLayout>
  );
}
