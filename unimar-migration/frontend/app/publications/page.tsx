'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faEye,
  faFileAlt,
  faGlobe,
  faLock,
  faArchive
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

interface Publication {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  publication_date: string;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export default function PublicationsPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && isAuthenticated) {
      fetchPublications();
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const fetchPublications = async () => {
    try {
      const response = await api.get('/publications/my');
      setPublications(response.data);
    } catch (error) {
      console.error('Error loading publications', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    const result = await Swal.fire({
      title: 'Eliminar publicación',
      text: `¿Estás seguro de eliminar "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/publications/${id}`);
        setPublications(prev => prev.filter(p => p.id !== id));
        Swal.fire('Eliminada', 'La publicación ha sido eliminada.', 'success');
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la publicación.', 'error');
      }
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/publications/${id}`, { status: newStatus });
      setPublications(prev => 
        prev.map(p => p.id === id ? { ...p, status: newStatus as Publication['status'] } : p)
      );
      Swal.fire('Actualizado', `Estado cambiado a ${getStatusLabel(newStatus)}.`, 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Borrador',
      published: 'Publicado',
      archived: 'Archivado'
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof faLock }> = {
      draft: { bg: 'bg-amber-100', text: 'text-amber-700', icon: faLock },
      published: { bg: 'bg-green-100', text: 'text-green-700', icon: faGlobe },
      archived: { bg: 'bg-slate-100', text: 'text-slate-700', icon: faArchive }
    };
    const style = styles[status] || styles.draft;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <FontAwesomeIcon icon={style.icon} className="w-3 h-3" />
        {getStatusLabel(status)}
      </span>
    );
  };

  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  return (
    <AdminLayout
      pageTitle="Publicaciones"
      pageDescription="Gestiona tus artículos y publicaciones del blog."
    >
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-slate-500">
          {publications.length} publicación{publications.length !== 1 ? 'es' : ''}
        </div>
        <button
          onClick={() => router.push('/publications/new')}
          className="flex items-center gap-2 px-4 py-2 bg-[#30669a] text-white rounded-lg hover:bg-[#265580] transition-colors font-medium"
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Publicación
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : publications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FontAwesomeIcon icon={faFileAlt} className="text-5xl text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">No hay publicaciones</h3>
          <p className="text-slate-500 mb-6">Crea tu primera publicación para comenzar.</p>
          <button
            onClick={() => router.push('/publications/new')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#30669a] text-white rounded-lg hover:bg-[#265580] transition-colors"
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Publicación
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Vistas
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publications.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{pub.title}</p>
                      {pub.description && (
                        <p className="text-sm text-slate-500 truncate max-w-md">{pub.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(pub.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(pub.publication_date).toLocaleDateString('es-VE')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-sm text-slate-600">
                      <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                      {pub.views_count}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {pub.status === 'draft' && (
                        <button
                          onClick={() => handleStatusChange(pub.id, 'published')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Publicar"
                        >
                          <FontAwesomeIcon icon={faGlobe} />
                        </button>
                      )}
                      {pub.status === 'published' && (
                        <button
                          onClick={() => handleStatusChange(pub.id, 'archived')}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Archivar"
                        >
                          <FontAwesomeIcon icon={faArchive} />
                        </button>
                      )}
                      <button
                        onClick={() => router.push(`/publications/${pub.id}/edit`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => handleDelete(pub.id, pub.title)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
