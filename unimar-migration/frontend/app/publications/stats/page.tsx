'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNewspaper,
  faFilter,
  faChartBar,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

interface PubStats {
  total: number;
  total_shares: number;
  status_counts: Record<string, number>;
  per_day: Array<{ date: string; fullDate: string; count: number }>;
  by_category: Array<{ name: string; count: number }>;
  by_author: Array<{ name: string; count: number }>;
  recent: Array<{ id: number; title: string; status: string; time_ago: string; tags: string[] }>;
}

type PeriodType = 'mes' | 'bimestre' | 'trimestre' | 'semestre' | 'anual' | 'custom';

const PIE_COLORS = ['#30669a', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const STATUS_LABELS: Record<string, string> = { published: 'Publicado', draft: 'Borrador', archived: 'Archivado' };
const STATUS_COLORS: Record<string, string> = { published: '#10b981', draft: '#f59e0b', archived: '#94a3b8' };

export default function PublicationStatsPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, isAdmin, isEditor } = useAuthStore();
  const [stats, setStats] = useState<PubStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('semestre');

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (!isAdmin() && !isEditor()) { router.push('/dashboard'); return; }
    // Set default dates (last 6 months)
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 6);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, [_hasHydrated, isAuthenticated]);

  const fetchStats = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (start || startDate) params.start_date = start || startDate;
      if (end || endDate) params.end_date = end || endDate;
      const { data } = await api.get('/publications/stats', { params });
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats when dates change
  useEffect(() => {
    if (startDate && endDate && isAuthenticated) {
      fetchStats(startDate, endDate);
    }
  }, [startDate, endDate, isAuthenticated]);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
    const end = new Date();
    const start = new Date();
    switch (period) {
      case 'mes': start.setMonth(start.getMonth() - 1); break;
      case 'bimestre': start.setMonth(start.getMonth() - 2); break;
      case 'trimestre': start.setMonth(start.getMonth() - 3); break;
      case 'semestre': start.setMonth(start.getMonth() - 6); break;
      case 'anual': start.setFullYear(start.getFullYear() - 1); break;
      default: return;
    }
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const handleFilter = () => fetchStats(startDate, endDate);
  const clearFilter = () => { setStartDate(''); setEndDate(''); fetchStats('', ''); };

  if (!_hasHydrated || loading) {
    return (
      <AdminLayout pageTitle="Estadísticas de Publicaciones" pageDescription="">
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#30669a] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  const statusData = Object.entries(stats.status_counts).map(([key, value]) => ({
    name: STATUS_LABELS[key] || key,
    value,
    color: STATUS_COLORS[key] || '#64748b',
  }));

  return (
    <AdminLayout pageTitle="Estadísticas de Publicaciones" pageDescription="Métricas y análisis del módulo de publicaciones.">
      {/* Period Filter Bar — matching multimedia stats style */}
      <div id="stats-filters" className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <FontAwesomeIcon icon={faFilter} className="text-[#30669a]" />
            <span className="font-medium">Filtrar por fecha:</span>
          </div>

          {/* Period Buttons */}
          <div className="flex gap-2">
            {[
              { label: 'Mes', value: 'mes' as PeriodType },
              { label: 'Bimestre', value: 'bimestre' as PeriodType },
              { label: 'Trimestre', value: 'trimestre' as PeriodType },
              { label: 'Semestre', value: 'semestre' as PeriodType },
              { label: 'Anual', value: 'anual' as PeriodType },
            ].map((btn) => (
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

      {/* KPI Card — Total only */}
      <div id="stats-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Publicaciones</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-[#30669a] rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faNewspaper} className="text-xl" />
          </div>
        </div>
        {Object.entries(stats.status_counts).map(([key, value]) => (
          <div key={key} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">{STATUS_LABELS[key] || key}</p>
              <p className="text-3xl font-bold mt-1" style={{ color: STATUS_COLORS[key] || '#64748b' }}>{value}</p>
            </div>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${STATUS_COLORS[key] || '#64748b'}15` }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[key] || '#64748b' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div id="stats-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Timeline — Publicaciones por día */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faChartBar} className="text-[#30669a]" />
            Publicaciones por Día
          </h3>
          {stats.per_day.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Sin datos en este rango.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.per_day}>
                <defs>
                  <linearGradient id="pubGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30669a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#30669a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="count" name="Publicaciones" stroke="#30669a" fill="url(#pubGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Pie */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Por Estado</h3>
          {statusData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-12">Sin datos.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

        {/* By Category */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mt-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Por Categoría</h3>
          {stats.by_category.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">Sin categorías asignadas.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.by_category} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                <Tooltip />
                <Bar dataKey="count" name="Publicaciones" fill="#30669a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

      {/* Recent publications */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700">Últimas Publicaciones</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recent.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No hay publicaciones recientes.</div>
          ) : (
            stats.recent.map((pub) => (
              <div
                key={pub.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => router.push(`/publications/${pub.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">{pub.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-400">{pub.time_ago}</span>
                    {pub.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-[#30669a]/10 text-[#30669a] px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  pub.status === 'published' ? 'bg-green-100 text-green-700' :
                  pub.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {STATUS_LABELS[pub.status] || pub.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
