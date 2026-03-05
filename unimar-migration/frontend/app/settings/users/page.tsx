'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserShield, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';

export default function UsersManagementPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin()) {
        router.push('/dashboard');
        Swal.fire('Acceso Denegado', 'No tienes permisos para ver esta sección.', 'error');
      } else {
        fetchUsers();
      }
    }
  }, [isAuthenticated, _hasHydrated, isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
      Swal.fire('Error', 'No se pudieron cargar los usuarios.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      Swal.fire({
        title: 'Actualizado',
        text: 'Rol actualizado exitosamente',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
      fetchUsers();
    } catch (error) {
       console.error('Error changing role', error);
       Swal.fire('Error', 'Hubo un error al actualizar el rol', 'error');
    }
  };

  if (!_hasHydrated || !isAuthenticated || !isAdmin()) return null;

  return (
    <AdminLayout
      pageTitle="Gestión de Usuarios"
      pageDescription="Administra los roles y accesos de los usuarios en la plataforma."
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-[#30669a]" />
            <h2 className="font-semibold text-slate-800">Usuarios del Sistema</h2>
          </div>
          <span className="text-sm text-slate-500">{users.length} Registros</span>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12 text-slate-400">
               <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo</th>
                  <th className="px-6 py-4">Rol Actual</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                   const currentRole = u.roles && u.roles.length > 0 ? u.roles[0].name : 'usuario';
                   
                   return (
                     <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                         {u.avatar ? (
                           <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                         ) : (
                           <div className="w-8 h-8 rounded-full bg-[#30669a]/10 flex items-center justify-center text-[#30669a] font-bold">
                             {u.first_name?.[0] || 'U'}{u.last_name?.[0] || ''}
                           </div>
                         )}
                         {u.first_name || 'Usuario'} {u.last_name || 'Desconocido'}
                       </td>
                       <td className="px-6 py-4 text-slate-500">{u.email}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                           currentRole === 'admin' ? 'bg-red-50 text-red-600 border-red-200' :
                           currentRole === 'editor' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                           'bg-blue-50 text-blue-600 border-blue-200'
                         }`}>
                           {currentRole}
                         </span>
                       </td>
                       <td className="px-6 py-4 flex justify-center">
                         <select
                           value={currentRole}
                           onChange={(e) => handleChangeRole(u.id, e.target.value)}
                           className="text-sm bg-white border border-slate-300 text-slate-700 rounded-lg focus:ring-[#30669a] focus:border-[#30669a] block w-full outline-none p-2"
                         >
                           <option value="admin">Administrador</option>
                           <option value="editor">Editor</option>
                           <option value="usuario">Visualizador/Usuario</option>
                         </select>
                       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
