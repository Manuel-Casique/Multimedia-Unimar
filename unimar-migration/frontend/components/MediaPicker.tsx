'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSearch, 
  faImage,
  faCheck,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import api from '@/lib/api';

interface MediaAsset {
  id: number;
  title: string;
  file_path: string;
  original_name: string;
  mime_type: string;
  thumbnail_path: string | null;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset, url: string) => void;
  multiple?: boolean;
}

export default function MediaPicker({ isOpen, onClose, onSelect, multiple = false }: MediaPickerProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/media', {
        params: {
          type: 'image',
          per_page: 100
        }
      });
      // Handle both paginated and non-paginated responses
      const data = response.data.data || response.data;
      setAssets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading media', error);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (asset: MediaAsset) => {
    const path = asset.thumbnail_path || asset.file_path;
    return `${backendUrl}/storage/${path}`;
  };

  const getFullImageUrl = (asset: MediaAsset) => {
    return `${backendUrl}/storage/${asset.file_path}`;
  };

  const filteredAssets = assets.filter(asset => 
    asset.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.original_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (asset: MediaAsset) => {
    if (multiple) {
      setSelectedIds(prev => 
        prev.includes(asset.id) 
          ? prev.filter(id => id !== asset.id)
          : [...prev, asset.id]
      );
    } else {
      onSelect(asset, getFullImageUrl(asset));
      onClose();
    }
  };

  const handleConfirmMultiple = () => {
    const selectedAssets = assets.filter(a => selectedIds.includes(a.id));
    selectedAssets.forEach(asset => {
      onSelect(asset, getFullImageUrl(asset));
    });
    setSelectedIds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[90vw] max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            Seleccionar Imagen
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100">
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" 
            />
            <input
              type="text"
              placeholder="Buscar imágenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#30669a] focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FontAwesomeIcon icon={faSpinner} className="text-3xl text-[#30669a] animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <FontAwesomeIcon icon={faImage} className="text-5xl mb-4" />
              <p>No hay imágenes disponibles</p>
              <p className="text-sm">Sube imágenes desde la sección Multimedia</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => handleSelect(asset)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all
                    hover:scale-105 hover:shadow-lg
                    ${selectedIds.includes(asset.id) 
                      ? 'border-[#30669a] ring-2 ring-[#30669a]/30' 
                      : 'border-transparent hover:border-slate-300'
                    }
                  `}
                >
                  <img
                    src={getImageUrl(asset)}
                    alt={asset.title || asset.original_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {selectedIds.includes(asset.id) && (
                    <div className="absolute inset-0 bg-[#30669a]/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#30669a] rounded-full flex items-center justify-center">
                        <FontAwesomeIcon icon={faCheck} className="text-white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      {asset.title || asset.original_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer (for multiple selection) */}
        {multiple && selectedIds.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <p className="text-sm text-slate-600">
              {selectedIds.length} imagen{selectedIds.length !== 1 ? 'es' : ''} seleccionada{selectedIds.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleConfirmMultiple}
              className="px-4 py-2 bg-[#30669a] text-white rounded-lg hover:bg-[#265580] transition-colors font-medium"
            >
              Insertar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
