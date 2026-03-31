'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import AdminLayout from '@/components/AdminLayout';
import toast from '@/lib/toast';
import api from '@/lib/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faDownload, faHistory, faClock, faTrash, faSpinner, faCheckCircle, faTimesCircle, faWifi, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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

  // Backup status polling
  const [backupStatus, setBackupStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule
  const [backupTime, setBackupTime] = useState('03:00');
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [schedulerActive, setSchedulerActive] = useState<boolean | null>(null);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
    if (_hasHydrated && isAuthenticated && !isAdmin()) {
      router.push('/dashboard');
    } else if (_hasHydrated && isAuthenticated && isAdmin()) {
      fetchBackups();
      fetchSchedule();
      checkInitialStatus();
      checkSchedulerStatus();
    }
  }, [isAuthenticated, isAdmin, _hasHydrated, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

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

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const response = await api.get('/backups/schedule');
      setBackupTime(response.data.backup_time || '03:00');
    } catch (error) {
      console.error('Error fetching schedule', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const checkInitialStatus = async () => {
    try {
      const response = await api.get('/backups/status');
      if (response.data.status === 'running') {
        setBackupStatus('running');
        setLoading(true);
        startPolling();
        startProgressSimulation();
      }
    } catch (e) {
      // Ignore — server may not support this yet
    }
  };

  const checkSchedulerStatus = async () => {
    try {
      const response = await api.get('/backups/scheduler-status');
      setSchedulerActive(response.data.active === true);
    } catch (e) {
      // Endpoint may not exist yet, assume unknown
      setSchedulerActive(null);
    }
  };

  const startPolling = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const response = await api.get('/backups/status');
        const status = response.data.status;

        if (status === 'completed') {
          setBackupStatus('completed');
          setProgress(100);
          setLoading(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (progressRef.current) clearInterval(progressRef.current);
          toast.success('¡Respaldo Exitoso!', 'La copia de seguridad se ha generado correctamente.');
          fetchBackups();
          // Reset to idle after a moment
          setTimeout(() => { setBackupStatus('idle'); setProgress(0); }, 4000);
        } else if (status === 'failed') {
          setBackupStatus('failed');
          setLoading(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (progressRef.current) clearInterval(progressRef.current);
          toast.error('Error', 'El respaldo ha fallado. Revisa los logs del servidor.');
          setTimeout(() => { setBackupStatus('idle'); setProgress(0); }, 4000);
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 3000);
  }, []);

  const startProgressSimulation = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress(prev => {
        // Simulate progress that slows down as it approaches 90%
        if (prev >= 90) return prev;
        const increment = Math.max(0.3, (90 - prev) * 0.04);
        return Math.min(90, prev + increment);
      });
    }, 500);
  }, []);

  const handleBackup = async () => {
    setLoading(true);
    setBackupStatus('running');
    setProgress(0);

    try {
      const response = await api.post('/backups');
      if (response.data.success === false) {
        toast.error('Error', response.data.message);
        setLoading(false);
        setBackupStatus('idle');
        return;
      }
      // Start polling and progress simulation
      startPolling();
      startProgressSimulation();
    } catch (error: any) {
      console.error('Error generating backup', error);
      const msg = error?.response?.data?.message || 'Hubo un error al generar el respaldo.';
      toast.error('Error', msg);
      setLoading(false);
      setBackupStatus('idle');
      setProgress(0);
    }
  };

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await api.post('/backups/schedule', { backup_time: backupTime });
      toast.success('Guardado', `Los respaldos automáticos se realizarán diariamente a las ${backupTime}.`);
    } catch (error) {
      console.error('Error saving schedule', error);
      toast.error('Error', 'No se pudo guardar la configuración.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
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
      {/* Scheduler status banner */}
      {schedulerActive === false && (
        <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-5 py-4">
          <FontAwesomeIcon icon={faExclamationTriangle} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">El scheduler no está activo</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Los respaldos automáticos no se ejecutarán. Para activarlo, reinicia el contenedor Docker — el scheduler se inicia automáticamente con el servidor.
            </p>
          </div>
        </div>
      )}
      {schedulerActive === true && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">
            <FontAwesomeIcon icon={faWifi} className="mr-2" />
            Scheduler activo — los respaldos automáticos están habilitados.
          </p>
        </div>
      )}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Create Backup + Schedule */}
        <div className="md:col-span-1 space-y-6">
          {/* Generar Respaldo */}
          <div id="backup-generate-card" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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

              {/* Progress Bar */}
              {backupStatus !== 'idle' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      {backupStatus === 'running' && (
                        <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Generando respaldo...</>
                      )}
                      {backupStatus === 'completed' && (
                        <><FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500" /> ¡Respaldo completado!</>
                      )}
                      {backupStatus === 'failed' && (
                        <><FontAwesomeIcon icon={faTimesCircle} className="text-red-500" /> Error en respaldo</>
                      )}
                    </span>
                    <span className="text-slate-400">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        backupStatus === 'completed' ? 'bg-emerald-500' :
                        backupStatus === 'failed' ? 'bg-red-500' :
                        'bg-[#30669a]'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleBackup}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#30669a' }}
              >
                {loading ? (
                  <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Respaldo en progreso...</>
                ) : (
                  <><FontAwesomeIcon icon={faDownload} /> Generar Nuevo Respaldo</>
                )}
              </button>
            </div>
          </div>

          {/* Programación Automática */}
          <div id="backup-schedule-card" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-slate-800 font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                </span>
                Respaldo Automático
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-500">
                Configura la hora en la que el sistema realizará una copia de seguridad automática diariamente.
              </p>

              {loadingSchedule ? (
                <div className="flex items-center justify-center py-4 text-slate-400 text-sm">
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> Cargando...
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="backupTime" className="block text-sm font-medium text-slate-700 mb-1">
                      Hora del respaldo diario
                    </label>
                    <input
                      id="backupTime"
                      type="time"
                      value={backupTime}
                      onChange={(e) => setBackupTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSaveSchedule}
                    disabled={savingSchedule}
                    className="w-full flex justify-center items-center gap-2 py-2.5 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: '#30669a' }}
                  >
                    {savingSchedule ? (
                      <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Guardando...</>
                    ) : (
                      <><FontAwesomeIcon icon={faClock} /> Guardar Horario</>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Historial de Respaldos */}
        <div className="md:col-span-2">
           <div id="backup-history-card" className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden h-full">
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
                          <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
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
