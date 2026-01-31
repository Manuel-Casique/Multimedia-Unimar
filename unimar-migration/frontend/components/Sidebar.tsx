'use client';

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
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const { isExpanded, isPinned, setExpanded } = useSidebarStore();

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
    {
      label: 'Multimedia',
      icon: faUpload,
      href: '/ingest',
    },
    {
      label: 'Galería',
      icon: faImages,
      href: '/gallery',
    },
    {
      label: 'Publicaciones',
      icon: faNewspaper,
      href: '/publications',
    },
    {
      label: 'Estadísticas',
      icon: faChartPie,
      href: '/stats',
    },
    {
      label: 'Configuración',
      icon: faCog,
      href: '/settings',
    },
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
        {navItems.map((item, index) => (
          <button
            key={index}
            onClick={() => router.push(item.href)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative overflow-hidden whitespace-nowrap text-left
              ${pathname === item.href 
                ? 'bg-[#30669a]/10 text-[#30669a] font-semibold' 
                : 'text-[#30669a] hover:bg-[#30669a]/5'
              }
            `}
          >
            <div className="w-5 flex justify-center flex-shrink-0">
               <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
            </div>
            
            <span className={`
               text-sm transition-all duration-300 origin-left
               ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 absolute left-14'}
            `}>
               {item.label}
            </span>

            {/* Tooltip for collapsed state */}
            {!isExpanded && (
               <div className="absolute left-full ml-2 px-2 py-1 bg-[#30669a] text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
                  {item.label}
               </div>
            )}
          </button>
        ))}
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
