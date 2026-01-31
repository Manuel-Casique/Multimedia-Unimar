'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function PublicationStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data.publications);
      } catch (error) {
        console.error('Error fetching publication stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="h-40 bg-slate-100 rounded-xl animate-pulse"></div>;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#30669a]">Resumen de Publicaciones</h3>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Publicaciones</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        {/* Publicadas */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Publicadas</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.status_counts['published'] || 0}</p>
          </div>
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Borradores */}
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500 font-medium">Borradores</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{stats.status_counts['draft'] || 0}</p>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-semibold text-slate-700">Últimas Publicaciones</h4>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recent.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No hay publicaciones recientes.</div>
          ) : (
            stats.recent.map((pub: any) => (
              <div key={pub.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{pub.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{pub.time_ago}</p>
                </div>
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${pub.status === 'published' ? 'bg-green-100 text-green-700' : 
                    pub.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                `}>
                  {pub.status === 'published' ? 'Publicado' : 
                   pub.status === 'draft' ? 'Borrador' : pub.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
