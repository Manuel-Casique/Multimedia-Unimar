'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.put('/user/profile', {
        first_name: formData.first_name,
        last_name: formData.last_name,
      });
      
      // Update local user state
      if (response.data.user) {
        setUser(response.data.user);
      }
      
      MySwal.fire({
        icon: 'success',
        title: '¡Perfil actualizado!',
        text: 'Tus datos han sido guardados correctamente.',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo actualizar el perfil.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirmation) {
      MySwal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden.' });
      return;
    }
    
    setLoading(true);
    
    try {
      await api.put('/user/password', {
        current_password: formData.current_password,
        password: formData.new_password,
        password_confirmation: formData.new_password_confirmation,
      });
      
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      }));
      
      MySwal.fire({
        icon: 'success',
        title: '¡Contraseña actualizada!',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error('Error updating password:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'No se pudo actualizar la contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!_hasHydrated) return null;

  return (
    <AdminLayout 
      pageTitle="Configuración" 
      pageDescription="Administra tu perfil y preferencias de cuenta"
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-5 py-4" style={{ backgroundColor: '#30669a' }}>
            <h3 className="text-white font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Información Personal
            </h3>
          </div>
          
          <form onSubmit={handleSubmitProfile} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
                placeholder="Tu nombre"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
                placeholder="Tu apellido"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">El correo no puede ser modificado</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#30669a' }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="px-5 py-4" style={{ backgroundColor: '#30669a' }}>
            <h3 className="text-white font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Cambiar Contraseña
            </h3>
          </div>
          
          <form onSubmit={handleSubmitPassword} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Contraseña actual</label>
              <input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nueva contraseña</label>
              <input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                name="new_password_confirmation"
                value={formData.new_password_confirmation}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30669a]/20 focus:border-[#30669a] transition-all"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !formData.current_password || !formData.new_password}
              className="w-full py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#30669a' }}
            >
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
