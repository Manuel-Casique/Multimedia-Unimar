'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPhotoFilm, 
  faBolt, 
  faImage,
  faVideo,
  faFileAudio,
  faFile
} from '@fortawesome/free-solid-svg-icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface StatsData {
  total_files: number;
  total_size: number;
  total_size_formatted: string;
  type_counts: {
    image?: number;
    video?: number;
    audio?: number;
    other?: number;
  };
  category_data: Array<{ name: string; count: number }>;
}

const COLORS = ['#30669a', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
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
        total_size: 0,
        total_size_formatted: '0 KB',
        type_counts: {},
        category_data: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  // Prepare pie chart data
  const pieData = stats ? Object.entries(stats.type_counts).map(([name, value]) => ({
    name: name === 'image' ? 'Imágenes' : name === 'video' ? 'Videos' : name === 'audio' ? 'Audio' : 'Otros',
    value: value || 0
  })).filter(item => item.value > 0) : [];

  // Calculate totals for summary cards
  const totalFiles = stats?.total_files || 0;
  const totalSize = stats?.total_size_formatted || '0 KB';
  const imageCount = stats?.type_counts?.image || 0;
  const videoCount = stats?.type_counts?.video || 0;

  return (
    <AdminLayout
      pageTitle="Estadísticas"
      pageDescription="Análisis detallado de tus recursos multimedia."
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <FontAwesomeIcon icon={faPhotoFilm} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Archivos</p>
                <p className="text-2xl font-bold text-slate-800">{totalFiles.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <FontAwesomeIcon icon={faBolt} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Espacio Usado</p>
                <p className="text-2xl font-bold text-slate-800">{totalSize}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <FontAwesomeIcon icon={faImage} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Imágenes</p>
                <p className="text-2xl font-bold text-slate-800">{imageCount.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                <FontAwesomeIcon icon={faVideo} className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Videos</p>
                <p className="text-2xl font-bold text-slate-800">{videoCount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart - By Category */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Archivos por Categoría</h3>
              <div className="h-80">
                {stats?.category_data && stats.category_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.category_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#30669a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de categorías</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pie Chart - By Type */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Tipo</h3>
              <div className="h-80">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de tipos</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
