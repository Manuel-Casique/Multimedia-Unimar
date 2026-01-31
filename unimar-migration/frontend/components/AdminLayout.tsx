'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import Sidebar from './Sidebar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faUser } from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
}

export default function AdminLayout({ 
  children, 
  pageTitle = 'Panel de Administración',
  pageDescription
}: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { toggleSidebar, isPinned } = useSidebarStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated) return null;

  // Format user name like in reference: "APELLIDO, NOMBRE"
  const userName = user?.first_name && user?.last_name 
    ? `${user.last_name.toUpperCase()}, ${user.first_name.toUpperCase()}`
    : user?.email?.toUpperCase() || 'USUARIO';

  return (
    <div className="flex h-screen bg-[#f0f0f0] overflow-hidden" style={{ 
      fontFamily: "'Montserrat', 'Roboto', 'Raleway', sans-serif",
    }}>
      
      {/* Sidebar - White with blue icons, hover to expand */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar - Blue with user info */}
        <nav 
          className="w-full shadow-md flex items-center justify-between px-4"
          style={{ 
            backgroundColor: '#30669a',
            height: '57px'
          }}
        >
          {/* Left: Hamburger menu button */}
          <button 
            className={`p-2 rounded-lg transition-colors ${isPinned ? 'bg-white/20' : 'hover:bg-white/10'}`}
            onClick={toggleSidebar}
            title={isPinned ? 'Contraer menú' : 'Expandir menú'}
          >
            <FontAwesomeIcon icon={faBars} className="w-5 h-5 text-white" />
          </button>

          {/* Right: User info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              {user?.profile_photo_url ? (
                <img 
                  src={user.profile_photo_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-white" />
              )}
            </div>
            <span className="text-white font-medium text-sm hidden sm:block">
              {userName}
            </span>
          </div>
        </nav>

        {/* Content Area - Gray background */}
        <main className="flex-1 overflow-auto p-6 bg-[#f0f0f0]">
          <div className="max-w-7xl mx-auto">
            {/* Page Title */}
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">{pageTitle}</h1>
            {pageDescription && (
              <p className="text-gray-500 text-sm mb-6">{pageDescription}</p>
            )}
            
            {/* Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
