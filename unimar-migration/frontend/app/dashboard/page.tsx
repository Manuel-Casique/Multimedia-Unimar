'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import Sidebar from '@/components/Sidebar';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faHdd, faPhotoVideo, faUsers } from '@fortawesome/free-solid-svg-icons';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
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
    } finally {
      setLoading(false);
    }
  };

  if (!_hasHydrated || (isAuthenticated && !user)) return null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="flex h-screen bg-[#F5F5F5] overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gradient-to-r from-[#2D5C8B] to-[#1E4268] shadow-lg z-10 p-6 flex items-center justify-between">
            <h1 className="text-white font-semibold text-lg flex items-center gap-2">
               <FontAwesomeIcon icon={faChartPie} />
               Panel de Estadísticas
            </h1>
        </header>

        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {loading ? (
               <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-[#2D5C8B] border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : !stats ? (
               <div className="text-center py-10 text-slate-500">No se pudieron cargar las estadísticas.</div>
            ) : (
               <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <StatCard 
                       title="Total Archivos" 
                       value={stats.total_files} 
                       icon={faFileAlt} 
                       color="bg-blue-500" 
                     />
                     <StatCard 
                       title="Espacio Usado" 
                       value={stats.total_size_formatted} 
                       icon={faHdd} 
                       color="bg-purple-500" 
                     />
                     <StatCard 
                       title="Imágenes" 
                       value={stats.type_counts.image || 0} 
                       icon={faPhotoVideo} 
                       color="bg-green-500" 
                     />
                     <StatCard 
                       title="Videos" 
                       value={stats.type_counts.video || 0} 
                       icon={faPhotoVideo} 
                       color="bg-red-500" 
                     />
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Archivos por Categoría</h3>
                        <div className="h-80">
                           <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={stats.category_data}>
                                 <CartesianGrid strokeDasharray="3 3" />
                                 <XAxis dataKey="name" />
                                 <YAxis />
                                 <Tooltip />
                                 <Bar dataKey="count" fill="#2D5C8B" radius={[4, 4, 0, 0]} />
                              </BarChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-700 mb-4">Distribución por Tipo</h3>
                        <div className="h-80">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie
                                    data={Object.entries(stats.type_counts).map(([name, value]) => ({ name, value }))}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                 >
                                    {Object.entries(stats.type_counts).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                 </Pie>
                                 <Tooltip />
                                 <Legend />
                              </PieChart>
                           </ResponsiveContainer>
                        </div>
                     </div>
                  </div>
               </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
   return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>
            <FontAwesomeIcon icon={icon} className="w-6 h-6" />
         </div>
         <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
         </div>
      </div>
   );
}
