'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import AdminLayout from '@/components/AdminLayout';
import toast from '@/lib/toast';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faDownload, faHistory, faCheckCircle, faExclamationCircle, faServer, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

interface BackupFile {
  name: string;
  size: string;
  date: string;
  timestamp: number;
  status: string;
}

export default function BackupPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, _hasHydrated } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
    // Si no es admin, redirigir al dashboard (ya que las configuraciones son de admin)
    if (_hasHydrated && isAuthenticated && !isAdmin()) {
      router.push('/dashboard');
    } else if (_hasHydrated && isAuthenticated && isAdmin()) {
      fetchBackups();
    }
  }, [isAuthenticated, isAdmin, _hasHydrated, router]);

  const fetchBackups = async () => {
    setLoadingList(true);
    try {
      const response = await api.get('/backups');
      setBackups(response.data.data || []);
    } catch (error) {
      console.error('Error fetching backups', error);
      toast.error('Error', 'No se pudo cargar la lista de respaldos');
    } finally {
      setLoadingList(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    try {
      await api.post('/backups');
      toast.success('¡Respaldo Exitoso!', 'La copia de seguridad de la base de datos se ha generado correctamente.');
      fetchBackups();
    } catch (error) {
      console.error('Error generating backup', error);
      toast.error('Error', 'Hubo un error al generar el respaldo.');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      // Create an invisible link to download the file directly
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/backups/${filename}/download`;
      
      // Need to include authorization header if sanctum is used, 
      // easiest way for downloads is an authenticated proxy or using blob via axios
      const response = await api.get(`/backups/${filename}/download`, {
         responseType: 'blob'
      });
      
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      
    } catch (error) {
      console.error('Error downloading backup', error);
      toast.error('Error', 'No se pudo descargar el archivo.');
    }
  };

  const deleteBackup = async (filename: string) => {
    const result = await Swal.fire({
      title: '¿Eliminar respaldo?',
      text: `Se eliminará permanentemente: ${filename}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/backups/${filename}`);
      toast.success('Eliminado', 'El respaldo fue eliminado correctamente.');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup', error);
      toast.error('Error', 'No se pudo eliminar el archivo.');
    }
  };



  if (!_hasHydrated || !isAdmin()) return null;

  return (
    <AdminLayout 
      pageTitle="Respaldo y Seguridad" 
      pageDescription="Gestiona las copias de seguridad de la base de datos y revisa el estado del servidor."
    >
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Generar Respaldo */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-800 font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[#30669a] flex items-center justify-center">
                  <FontAwesomeIcon icon={faDatabase} className="w-4 h-4" />
                </span>
                Nuevo Respaldo
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500">
                Genera un archivo SQL cifrado que contiene toda la estructura y datos actuales. Mantener respaldos frecuentes previene la pérdida de información crítica.
              </p>
              
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#30669a' }}
              >
                <FontAwesomeIcon icon={faDownload} />
                {loading ? 'Generando...' : 'Generar Nuevo Respaldo'}
              </button>
            </div>
          </div>
        </div>

        {/* Historial de Respaldos */}
        <div className="md:col-span-2">
           <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-800 font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                </span>
                Últimos Respaldos Generados
              </h3>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Automáticos y Manuales</span>
            </div>
            <div className="p-0">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Archivo</th>
                      <th className="px-5 py-3 font-semibold">Fecha</th>
                      <th className="px-5 py-3 font-semibold">Tamaño</th>
                      <th className="px-5 py-3 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loadingList ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                          Cargando respaldos...
                        </td>
                      </tr>
                    ) : backups.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                          No hay respaldos generados aún.
                        </td>
                      </tr>
                    ) : (
                      backups.map((backup) => (
                        <tr key={backup.name} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 text-slate-800 font-medium">{backup.name}</td>
                          <td className="px-5 py-4 text-slate-500">{backup.date}</td>
                          <td className="px-5 py-4 text-slate-500">{backup.size}</td>
                          <td className="px-5 py-4 text-right space-x-2">
                             <button 
                               onClick={() => downloadBackup(backup.name)}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                             >
                               <FontAwesomeIcon icon={faDownload} /> Descargar
                             </button>
                             <button 
                               onClick={() => deleteBackup(backup.name)}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition"
                             >
                               <FontAwesomeIcon icon={faTrash} /> Eliminar
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
               </table>
            </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}
