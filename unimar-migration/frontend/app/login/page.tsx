'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      setToken(token);
      setUser(user);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Credenciales incorrectas.');
      } else if (err.response?.status === 403) {
        setError('Acceso restringido a @unimar.edu.ve');
      } else {
        setError('Error de conexión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ 
        fontFamily: "'Montserrat', 'Roboto', 'Raleway', sans-serif",
        fontSize: '0.85rem',
        fontWeight: 400,
        lineHeight: 1.6,
        color: '#212529',
        textAlign: 'left',
        backgroundColor: '#ffffff'
    }}>
      
      {/* Navbar - Exact Portal Match */}
      <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 flex justify-between items-center" style={{ maxWidth: '1140px', padding: '0.5rem 1rem' }}>
              <a href="https://portalunimar.unimar.edu.ve/home" className="flex items-center">
                  <img src="https://portalunimar.unimar.edu.ve/image/logounimar-22.jpg" style={{ width: '150px' }} alt="UNIMAR" />
              </a>
              <span style={{ color: '#30669a', fontWeight: 500 }}>Bienvenid@</span>
          </div>
      </nav>

      {/* Main Content - zy-6 padding */}
      <main style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
          <div className="container mx-auto px-4" style={{ maxWidth: '1140px' }}>
              <div className="flex justify-center">
                  {/* col-lg-8 col-xl-5 equivalent */}
                  <div className="w-full" style={{ maxWidth: '500px' }}>
                      
                      {/* Card */}
                      <div className="bg-white rounded-lg shadow-lg overflow-visible">
                          
                          {/* Card Header - Blue only for icon + title */}
                          <div 
                              id="login-card"
                              className="text-center flex flex-col items-center"
                              style={{ 
                                  borderRadius: 'calc(1rem - 1px) calc(1rem - 1px) 0 0',
                                  backgroundColor: '#30669a',
                                  borderBottom: '1px solid rgba(48, 102, 154, 0.125)',
                                  paddingTop: '1rem',
                                  paddingBottom: '1rem'
                              }}
                          >
                              {/* img-login - floats above using position relative */}
                              <img 
                                  src="https://portalunimar.unimar.edu.ve/./image/user.png" 
                                  alt="User" 
                                  className="img-login"
                                  style={{ 
                                      width: '100px',
                                      position: 'relative',
                                      bottom: '3.5rem',
                                      marginBottom: '-2.5rem'
                                  }}
                              />
                              {/* title-login */}
                              <span 
                                  className="title-login block"
                                  style={{ 
                                      color: '#fff',
                                      fontSize: '1.5rem',
                                      fontWeight: 600
                                  }}
                              >
                                  Inicio de sesión
                              </span>
                          </div>

                          {/* White Body - Form inputs, checkbox, button, links */}
                          <div className="p-6 bg-white">
                              <form onSubmit={handleSubmit}>
                                  {/* Email Row */}
                                  <div className="flex flex-wrap mb-4 items-center">
                                      <label htmlFor="email" className="w-full md:w-1/3 text-right pr-4 py-2 text-[#212529]">
                                          Correo electrónico
                                      </label>
                                      <div className="w-full md:w-1/2">
                                          <input 
                                              id="email" 
                                              type="email" 
                                              className="w-full px-3 py-2 text-base text-[#212529] bg-[#e8f0fe] border border-[#ced4da] rounded focus:border-[#86b7fe] focus:outline-none focus:ring-2 focus:ring-blue-200"
                                              required 
                                              autoFocus
                                              autoComplete="email"
                                              value={formData.email}
                                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                          />
                                      </div>
                                  </div>

                                  {/* Password Row */}
                                  <div className="flex flex-wrap mb-4 items-center">
                                      <label htmlFor="password" className="w-full md:w-1/3 text-right pr-4 py-2 text-[#212529]">
                                          Contraseña
                                      </label>
                                      <div className="w-full md:w-1/2 relative">
                                          <input 
                                              id="password" 
                                              type={showPassword ? 'text' : 'password'} 
                                              className="w-full px-3 py-2 pr-10 text-base text-[#212529] bg-[#e8f0fe] border border-[#ced4da] rounded focus:border-[#86b7fe] focus:outline-none focus:ring-2 focus:ring-blue-200"
                                              required 
                                              minLength={5}
                                              autoComplete="current-password"
                                              value={formData.password}
                                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                          />
                                          {/* Toggle Password Icon */}
                                          <i 
                                            className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'} cursor-pointer text-gray-500`}
                                            style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '15px' }}
                                            onClick={() => setShowPassword(!showPassword)}
                                          ></i>
                                      </div>
                                  </div>

                                  {/* Remember Checkbox */}
                                  <div className="flex flex-wrap mb-4">
                                      <div className="w-full md:w-1/2 md:ml-[33.333%]">
                                          <div className="flex items-center">
                                              <input 
                                                  className="w-4 h-4 text-[#30669a] border-gray-300 rounded focus:ring-[#30669a]" 
                                                  type="checkbox" 
                                                  id="remember"
                                                  checked={formData.remember}
                                                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                              />
                                              <label className="ml-2 text-[#212529] cursor-pointer" htmlFor="remember">
                                                  Recuerdame
                                              </label>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Login Button */}
                                  <div className="flex justify-center mb-4">
                                      <button 
                                          type="submit" 
                                          id="btn-login"
                                          className="py-2 px-8 text-base rounded text-white font-medium transition-colors disabled:opacity-65"
                                          style={{ 
                                              backgroundColor: '#30669a', 
                                              border: '1px solid rgba(48, 102, 154, 0.125)',
                                              minWidth: '180px'
                                          }} 
                                          disabled={isLoading}
                                      >
                                          {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                                      </button>
                                  </div>

                                  {/* Links */}
                                  <div className="text-center">
                                      <a href="#" className="text-[#30669a] hover:underline block mb-1" onClick={(e) => e.preventDefault()}>
                                          Regístrate
                                      </a>
                                      <a href="https://portalunimar.unimar.edu.ve/password/reset" className="text-[#30669a] hover:underline">
                                          ¿Olvidaste tu contraseña?
                                      </a>
                                  </div>

                                  {error && (
                                      <div className="mt-4 p-3 text-[#842029] bg-[#f8d7da] border border-[#f5c2c7] rounded text-center text-sm">
                                          {error}
                                      </div>
                                  )}
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </main>
    </div>
  );
}
