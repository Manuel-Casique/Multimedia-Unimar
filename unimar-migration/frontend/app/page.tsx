'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import PublicationStats from '@/components/PublicationStats';

export default function Home() {
  const { user } = useAuthStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 18) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          {greeting}, <span className="text-[#30669a]">{user?.name || 'Administrador'}</span>
        </h1>
        <p className="text-slate-500 mt-2">Bienvenido al Panel de Control de Multimedia UNIMAR.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column (2/3) - Publications Stats & Activity */}
        <div className="lg:col-span-2 space-y-8">
          <PublicationStats />
          
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
             <Link href="/publications/new" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#30669a] hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-blue-50 text-[#30669a] rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Nueva Publicación</h3>
                <p className="text-sm text-slate-500 mt-1">Crear noticia o evento</p>
             </Link>

             <Link href="/ingest" className="p-4 bg-white border border-slate-200 rounded-xl hover:border-[#30669a] hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">Subir Multimedia</h3>
                <p className="text-sm text-slate-500 mt-1">Cargar fotos o videos</p>
             </Link>
          </div>
        </div>

        {/* Sidebar Column (1/3) - System Status or Quick Links */}
        <div className="space-y-6">
          {/* System Info Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
            <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estado del Sistema
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Versión</span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">v1.2.0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Backend</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Base de Datos</span>
                <span className="text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> Conectado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
