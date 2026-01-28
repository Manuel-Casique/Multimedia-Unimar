'use client';

import { useCallback, useState } from 'react';
import { useIngestStore } from '@/stores/useIngestStore';

interface DropZoneProps {
  className?: string;
}

export default function DropZone({ className = '' }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { addFiles } = useIngestStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')
    );

    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles = Array.from(selectedFiles).filter(
        (file) => file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.startsWith('audio/')
      );
      if (validFiles.length > 0) {
        addFiles(validFiles);
      }
    }
    e.target.value = '';
  }, [addFiles]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-lg
        transition-all duration-300 ease-out
        shadow-sm
        ${isDragOver
          ? 'border-[#30669a] bg-[#30669a]/10 scale-[1.01] shadow-lg'
          : isHovered
            ? 'border-[#30669a]/50 bg-[#30669a]/5 shadow-md'
            : 'border-slate-200 bg-white'
        }
        ${className}
      `}
    >
      <input
        type="file"
        multiple
        accept="image/*,video/*,audio/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center pointer-events-none">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
          ${isDragOver || isHovered ? 'bg-[#30669a]/10 text-[#30669a]' : 'bg-slate-100 text-slate-400'}
        `}>
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        {/* Text */}
        <p className={`font-semibold mb-1 transition-colors ${isDragOver || isHovered ? 'text-[#30669a]' : 'text-slate-700'}`}>
          {isDragOver ? 'Suelta los archivos aquí' : 'Arrastra archivos multimedia'}
        </p>
        <p className="text-sm text-slate-400">
          o <span className="text-[#30669a] font-medium">haz clic para seleccionar</span>
        </p>
        
        {/* Supported formats */}
        <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Imágenes
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Videos
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Audio
          </span>
        </div>

        {/* File types and max size info */}
        <div className="mt-3 text-xs text-slate-400 border-t border-slate-100 pt-3">
          <p className="mb-1">
            <strong>Formatos:</strong> JPG, PNG, GIF, WEBP, MP4, MOV, AVI, MP3, WAV, OGG
          </p>
          <p>
            <strong>Tamaño máximo:</strong> 100MB por archivo
          </p>
        </div>
      </div>
    </div>
  );
}
