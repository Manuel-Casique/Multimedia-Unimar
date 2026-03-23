'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import toast from '@/lib/toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserPlus, faSpinner, faUserShield, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'editor', label: 'Editor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'usuario', label: 'Usuario', color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

export default function UsersManagementPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'usuario' });

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (!isAdmin()) {
        router.push('/dashboard');
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
      toast.error('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Rol Actualizado', `El rol se cambió a "${newRole}" correctamente.`);
      fetchUsers();
    } catch (error) {
       console.error('Error changing role', error);
       toast.error('Error', 'Hubo un error al actualizar el rol.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email.endsWith('@unimar.edu.ve')) {
      toast.error('Correo inválido', 'El correo debe ser una dirección @unimar.edu.ve');
      return;
    }
    setCreating(true);
    try {
      await api.post('/users', newUser);
      toast.success('Usuario Creado', 'El nuevo usuario ha sido registrado exitosamente.');
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: 'usuario' });
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user', error);
      const msg = error.response?.data?.message || 'Hubo un error al crear el usuario.';
      toast.error('Error', msg);
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (roleName: string) => {
    const role = ROLE_OPTIONS.find(r => r.value === roleName);
    return role || ROLE_OPTIONS[2];
  };

  if (!_hasHydrated || !isAuthenticated || !isAdmin()) return null;

  return (
    <AdminLayout
      pageTitle="Gestión de Usuarios"
      pageDescription="Administra los roles y accesos de los usuarios en la plataforma."
    >
      <div id="users-table" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUsers} className="text-[#30669a]" />
            <h2 className="font-semibold text-slate-800">Usuarios del Sistema</h2>
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full ml-2">{users.length}</span>
          </div>
          <button
            id="add-user-btn"
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: '#30669a' }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Agregar Usuario
          </button>
        </div>
        
        <div className="p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center p-12 text-slate-400">
               <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FontAwesomeIcon icon={faUsers} className="text-4xl mb-3 opacity-40" />
              <p>No hay usuarios registrados aún.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Correo Electrónico</th>
                  <th className="px-6 py-3">Rol Actual</th>
                  <th className="px-6 py-3 text-center">Cambiar Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                   const currentRole = u.role ? u.role.name : 'usuario';
                   const badge = getRoleBadge(currentRole);
                   
                   return (
                     <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           {u.avatar ? (
                             <img src={u.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                           ) : (
                             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#30669a] to-[#1d4773] flex items-center justify-center text-white text-xs font-bold">
                               {u.first_name?.[0] || 'U'}{u.last_name?.[0] || ''}
                             </div>
                           )}
                           <div>
                             <p className="font-semibold text-slate-800">{u.first_name || 'Usuario'} {u.last_name || ''}</p>
                             <p className="text-xs text-slate-400">ID: {u.id}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-slate-500">{u.email}</td>
                       <td className="px-6 py-4">
                         <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                           <FontAwesomeIcon icon={faUserShield} className="w-3 h-3" />
                           {badge.label}
                         </span>
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex justify-center gap-1">
                           {ROLE_OPTIONS.map((role) => (
                             <button
                               key={role.value}
                               onClick={() => {
                                 if (role.value !== currentRole) {
                                   handleChangeRole(u.id, role.value);
                                 }
                               }}
                               disabled={role.value === currentRole}
                               className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                                 role.value === currentRole
                                   ? `${role.color} cursor-default opacity-100 ring-2 ring-offset-1 ring-slate-300`
                                   : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 cursor-pointer'
                               }`}
                             >
                               {role.label}
                             </button>
                           ))}
                         </div>
                       </td>
                     </tr>
                   );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para crear usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between" style={{ backgroundColor: '#30669a' }}>
              <h3 className="font-bold text-white flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} />
                Nuevo Usuario
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition">
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({...newUser, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] outline-none transition"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({...newUser, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] outline-none transition"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] outline-none transition"
                    placeholder="usuario@unimar.edu.ve"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#30669a]/30 focus:border-[#30669a] outline-none transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
                <div className="flex gap-2">
                  {ROLE_OPTIONS.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setNewUser({...newUser, role: role.value})}
                      className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${
                        newUser.role === role.value
                          ? `${role.color} ring-2 ring-offset-1 ring-slate-300`
                          : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2.5 text-sm font-medium text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#30669a' }}
                >
                  {creating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
