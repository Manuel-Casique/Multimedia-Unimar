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
  faCalendarDays,
  faFilter
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
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
  timeline_data: Array<{ date: string; fullDate: string; count: number }>;
  author_data: Array<{ name: string; count: number }>;
  hourly_data: Array<{ hour: string; count: number }>;
}

const COLORS = ['#30669a', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];

type PeriodType = 'mes' | 'bimestre' | 'trimestre' | 'semestre' | 'custom';

export default function StatsPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Date filter states
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('semestre');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    } else if (_hasHydrated && isAuthenticated) {
      // Set default dates (last 6 months)
      const end = new Date();
      const start = new Date();
      start.setMonth(start.getMonth() - 6);
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Fetch stats when dates change
  useEffect(() => {
    if (startDate && endDate && isAuthenticated) {
      fetchStats();
    }
  }, [startDate, endDate, isAuthenticated]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats', error);
      setStats({
        total_files: 0,
        total_size: 0,
        total_size_formatted: '0 KB',
        type_counts: {},
        category_data: [],
        timeline_data: [],
        author_data: [],
        hourly_data: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'mes':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'bimestre':
        start.setMonth(start.getMonth() - 2);
        break;
      case 'trimestre':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'semestre':
        start.setMonth(start.getMonth() - 6);
        break;
      default:
        return; // custom - don't change dates
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
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

  const periodButtons: { label: string; value: PeriodType }[] = [
    { label: 'Mes', value: 'mes' },
    { label: 'Bimestre', value: 'bimestre' },
    { label: 'Trimestre', value: 'trimestre' },
    { label: 'Semestre', value: 'semestre' },
  ];

  return (
    <AdminLayout
      pageTitle="Estadísticas"
      pageDescription="Análisis detallado de tus recursos multimedia."
    >
      {/* Date Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <FontAwesomeIcon icon={faFilter} className="text-[#30669a]" />
            <span className="font-medium">Filtrar por fecha:</span>
          </div>
          
          {/* Period Buttons */}
          <div className="flex gap-2">
            {periodButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => handlePeriodChange(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriod === btn.value
                    ? 'bg-[#30669a] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
          
          {/* Date Inputs */}
          <div className="flex items-center gap-2 ml-auto">
            <FontAwesomeIcon icon={faCalendarDays} className="text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setSelectedPeriod('custom');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setSelectedPeriod('custom');
              }}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
            />
          </div>
        </div>
      </div>

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

          {/* Charts - Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Timeline Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Archivos Subidos (Timeline)</h3>
              <div className="h-80">
                {stats?.timeline_data && stats.timeline_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.timeline_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#30669a" 
                        strokeWidth={3}
                        dot={{ fill: '#30669a', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#1e4a73' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos en este período</p>
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

          {/* Charts - Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Author Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Autor</h3>
              <div className="h-80">
                {stats?.author_data && stats.author_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.author_data} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#22c55e" 
                        radius={[0, 4, 4, 0]}
                        animationDuration={800}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de autores</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hourly Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Actividad por Hora del Día</h3>
              <div className="h-80">
                {stats?.hourly_data && stats.hourly_data.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.hourly_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [value, 'Archivos']}
                      />
                      <defs>
                        <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#a855f7" 
                        strokeWidth={2}
                        fill="url(#colorHourly)"
                        animationDuration={800}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <FontAwesomeIcon icon={faPhotoFilm} className="text-4xl mb-2 opacity-50" />
                      <p>No hay datos de actividad</p>
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
