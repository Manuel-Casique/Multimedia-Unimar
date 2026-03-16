'use client';

import { useState } from 'react';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSidebarStore } from '@/stores/useSidebarStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome,
  faUpload, 
  faImages, 
  faChartPie, 
  faCog, 
  faSignOutAlt,
  faNewspaper,
  faUsers,
  faTag,
  faChevronDown,
  faChevronRight,
  faUser,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAdmin, isEditor } = useAuthStore();
  const { isExpanded, isPinned, setExpanded } = useSidebarStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleToggleDropdown = (label: string) => {
    if (!isExpanded) setExpanded(true);
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setExpanded(false);
    }
  };

  const navItems = [
    { label: 'Multimedia', icon: faUpload, href: '/ingest' },
    { label: 'Galería', icon: faImages, href: '/gallery' },
    ...(isAdmin() || isEditor() ? [{ label: 'Publicaciones', icon: faNewspaper, href: '/publications' }] : []),
    { 
      label: 'Estadísticas', 
      icon: faChartPie, 
      items: [
        { label: 'Multimedia', href: '/stats' },
        { label: 'Publicaciones', href: '/publications/stats' }
      ]
    },
    ...(isAdmin() ? [{ label: 'Taxonomía', icon: faTag, href: '/settings/catalog' }] : []),
    ...(isAdmin() ? [{ label: 'Usuarios', icon: faUsers, href: '/settings/users' }] : []),
    { label: 'Perfil', icon: faUser, href: '/profile' },
    ...(isAdmin() ? [{ label: 'Respaldo', icon: faDatabase, href: '/settings' }] : []),
  ];

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative bg-white
        flex flex-col shadow-lg z-20 transition-[width] duration-300 ease-out will-change-[width]
        border-r border-gray-200
        ${isExpanded ? 'w-[250px]' : 'w-[60px]'} 
      `}
    >
      {/* Header / Logo with text beside it */}
      <div 
        className="h-[70px] flex items-center px-3 border-b border-gray-200 bg-white overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => router.push('/dashboard')}
      >
        <div className="flex items-center gap-2 w-full">
          <img 
            src="https://portalunimar.unimar.edu.ve/image/logo-unimar-127.png" 
            alt="UNIMAR" 
            className="h-10 w-auto object-contain flex-shrink-0"
          />
          {isExpanded && (
            <div className="text-left animate-fade-in flex-shrink-0">
              <p className="text-[11px] font-semibold text-[#30669a] leading-tight whitespace-nowrap">Universidad de Margarita</p>
              <p className="text-[10px] text-[#30669a] leading-tight whitespace-nowrap">Alma Mater del Caribe</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 flex flex-col gap-1 px-2 pt-4">
        {navItems.map((item, index) => {
          const hasDropdown = !!item.items;
          const isOpen = openDropdown === item.label;
          const isActive = item.href ? pathname === item.href : (hasDropdown && item.items.some(sub => pathname === sub.href));

          return (
            <div key={index}>
              <button
                onClick={() => hasDropdown ? handleToggleDropdown(item.label) : router.push(item.href!)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-md transition-all duration-200 group relative overflow-hidden whitespace-nowrap text-left
                  ${isActive 
                    ? 'bg-[#30669a]/10 text-[#30669a] font-semibold' 
                    : 'text-[#30669a] hover:bg-[#30669a]/5'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 flex justify-center flex-shrink-0">
                     <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                  </div>
                  
                  <span className={`
                     text-sm transition-all duration-300 origin-left
                     ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}
                  `}>
                     {item.label}
                  </span>
                </div>

                {hasDropdown && isExpanded && (
                  <FontAwesomeIcon 
                    icon={isOpen ? faChevronDown : faChevronRight} 
                    className="w-3 h-3 text-current opacity-70 flex-shrink-0"
                  />
                )}

                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                   <div className="absolute left-full ml-2 px-2 py-1 bg-[#30669a] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                      {item.label}
                   </div>
                )}
              </button>

              {/* Dropdown Content */}
              {hasDropdown && isOpen && isExpanded && (
                <div className="flex flex-col gap-1 mt-1 pl-11 pr-2 animate-fade-in">
                  {item.items.map((sub, subIdx) => (
                    <button
                      key={subIdx}
                      onClick={() => router.push(sub.href)}
                      className={`
                        text-left text-xs py-2 px-3 rounded-md transition-colors
                        ${pathname === sub.href
                           ? 'bg-[#30669a]/10 text-[#30669a] font-semibold'
                           : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                        }
                      `}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="p-2 mt-auto mb-2 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative overflow-hidden whitespace-nowrap
            text-red-500 hover:bg-red-50
          `}
        >
          <div className="w-5 flex justify-center flex-shrink-0">
             <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
          </div>
          
          <span className={`
               text-sm font-medium transition-all duration-300 origin-left
               ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}
          `}>
             Cerrar Sesión
          </span>
        </button>
      </div>
    </aside>
  );
}
