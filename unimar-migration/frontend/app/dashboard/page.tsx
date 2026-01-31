'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faImages, 
  faChartPie, 
  faCog,
  faClock,
  faPhotoFilm,
  faImage,
  faVideo,
  faFileAudio,
  faFile
} from '@fortawesome/free-solid-svg-icons';

interface DashboardStats {
  total_files: number;
  total_size_formatted: string;
  type_counts: {
    image?: number;
    video?: number;
    audio?: number;
  };
  recent_activity: Array<{
    id: number;
    title: string;
    type: string;
    time: string;
    status: string;
  }>;
  publications?: {
    total: number;
    status_counts: { [key: string]: number };
    recent: Array<{
      id: number;
      title: string;
      slug: string;
      status: string;
      time_ago: string;
    }>;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, _hasHydrated, router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats', error);
      setStats({
        total_files: 0,
        total_size_formatted: '0 KB',
        type_counts: {},
        recent_activity: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  const getTypeIcon = (type: string) => {
    const icons: Record<string, typeof faImage> = {
      'image': faImage,
      'video': faVideo,
      'audio': faFileAudio,
    };
    return icons[type] || faFile;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      'completed': { bg: 'bg-green-100', text: 'text-green-700', label: 'Completado' },
      'processing': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Procesando' },
      'pending': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
    };
    const badge = badges[status] || badges['completed'];
    return (
      <span className={`text-xs px-2 py-1 ${badge.bg} ${badge.text} rounded-full font-medium`}>
        {badge.label}
      </span>
    );
  };

  // Quick access cards
  const quickAccess = [
    { label: 'Subir Archivos', icon: faUpload, href: '/ingest', color: 'bg-blue-500' },
    { label: 'Ver Galería', icon: faImages, href: '/gallery', color: 'bg-green-500' },
    { label: 'Estadísticas', icon: faChartPie, href: '/stats', color: 'bg-purple-500' },
    { label: 'Configuración', icon: faCog, href: '/settings', color: 'bg-slate-500' },
  ];

  return (
    <AdminLayout
      pageTitle="Panel de Control"
      pageDescription={`Bienvenido, ${user?.first_name || 'Usuario'}. Gestiona tus recursos multimedia.`}
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Quick Access Cards */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Acceso Rápido</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickAccess.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(item.href)}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center gap-3 hover:shadow-md hover:border-[#30669a]/30 transition-all group"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white ${item.color} group-hover:scale-110 transition-transform`}>
                    <FontAwesomeIcon icon={item.icon} className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FontAwesomeIcon icon={faPhotoFilm} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Archivos</p>
                <p className="text-xl font-bold text-slate-800">{stats?.total_files?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <FontAwesomeIcon icon={faImage} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Imágenes</p>
                <p className="text-xl font-bold text-slate-800">{stats?.type_counts?.image || 0}</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <FontAwesomeIcon icon={faVideo} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Videos</p>
                <p className="text-xl font-bold text-slate-800">{stats?.type_counts?.video || 0}</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2 text-slate-700">
                <FontAwesomeIcon icon={faClock} className="text-[#30669a]" />
                Actividad Reciente
              </h3>
              <button 
                onClick={() => router.push('/gallery')}
                className="text-xs font-medium text-[#30669a] hover:underline"
              >
                Ver todo
              </button>
            </div>
            <div>
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {stats.recent_activity.slice(0, 5).map((activity) => (
                    <li key={activity.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                          <FontAwesomeIcon icon={getTypeIcon(activity.type)} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 truncate max-w-[200px]">{activity.title}</p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-3 opacity-50" />
                  <p>No hay actividad reciente</p>
                  <button 
                    onClick={() => router.push('/ingest')}
                    className="mt-3 text-sm text-[#30669a] hover:underline"
                  >
                    Subir archivos
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Publications Summary */}
          {stats?.publications && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-[#30669a]">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Resumen de Publicaciones
                </h3>
                <button 
                  onClick={() => router.push('/publications')}
                  className="text-xs font-medium text-white/80 hover:text-white hover:underline"
                >
                  Ver todas
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 divide-x divide-slate-100">
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-800">{stats.publications.total}</p>
                  <p className="text-xs text-slate-500 mt-1">Total</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{stats.publications.status_counts['published'] || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Publicadas</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{stats.publications.status_counts['draft'] || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Borradores</p>
                </div>
              </div>

              {/* Recent Publications List */}
              {stats.publications.recent.length > 0 ? (
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {stats.publications.recent.map((pub) => (
                    <li 
                      key={pub.id} 
                      className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/publications/${pub.id}/edit`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[300px]">{pub.title}</p>
                        <p className="text-xs text-slate-400">{pub.time_ago}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        pub.status === 'published' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {pub.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-slate-400 border-t border-slate-100">
                  <p>No hay publicaciones aún</p>
                  <button 
                    onClick={() => router.push('/publications/new')}
                    className="mt-2 text-sm text-[#30669a] hover:underline"
                  >
                    Crear primera publicación
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-slate-400 text-sm pt-4">
            © {new Date().getFullYear()} UNIMAR Multimedia Asset Management System
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
