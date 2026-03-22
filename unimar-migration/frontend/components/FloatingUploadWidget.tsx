'use client';

import { useEffect, useState } from 'react';
import { useUploadStore } from '@/stores/useUploadStore';

export default function FloatingUploadWidget() {
  const {
    isUploading,
    isComplete,
    isMinimized,
    hasError,
    errorMessage,
    progress,
    totalFiles,
    currentFileIndex,
    currentFileName,
    cancelUpload,
    dismiss,
    toggleMinimize,
  } = useUploadStore();

  const [visible, setVisible] = useState(false);

  // Show/hide with auto-dismiss after completion
  useEffect(() => {
    if (isUploading || isComplete || hasError) {
      setVisible(true);
    }
  }, [isUploading, isComplete, hasError]);

  useEffect(() => {
    if (isComplete && !hasError) {
      const timer = setTimeout(() => {
        setVisible(false);
        dismiss();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, hasError, dismiss]);

  if (!visible) return null;

  // Status color
  const barColor = hasError
    ? 'bg-red-500'
    : isComplete
    ? 'bg-green-500'
    : 'bg-[#30669a]';

  const statusText = hasError
    ? errorMessage || 'Error en la subida'
    : isComplete
    ? `${totalFiles} archivo${totalFiles !== 1 ? 's' : ''} subido${totalFiles !== 1 ? 's' : ''} ✓`
    : `Subiendo ${currentFileIndex}/${totalFiles}: ${currentFileName}`;

  return (
    <div
      className={`
        fixed top-[65px] right-4 z-50
        bg-white rounded-xl shadow-2xl border border-slate-200
        transition-all duration-300 ease-out
        ${isMinimized ? 'w-[220px]' : 'w-[340px]'}
      `}
      style={{ 
        animation: 'slideInRight 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-between px-3 py-2 rounded-t-xl cursor-pointer
          ${hasError ? 'bg-red-50' : isComplete ? 'bg-green-50' : 'bg-[#30669a]'}
        `}
        onClick={toggleMinimize}
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          {isUploading && (
            <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {isComplete && !hasError && (
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {hasError && (
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className={`text-xs font-semibold truncate ${
            hasError ? 'text-red-700' : isComplete ? 'text-green-700' : 'text-white'
          }`}>
            {isUploading ? 'Subiendo archivos...' : isComplete ? '¡Subida completada!' : 'Error en subida'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize / Expand */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}
            className={`p-1 rounded hover:bg-white/20 transition-colors ${
              hasError ? 'text-red-500' : isComplete ? 'text-green-500' : 'text-white/70'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMinimized ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
          </button>
          {/* Dismiss (only when complete or error) */}
          {(isComplete || hasError) && (
            <button
              onClick={(e) => { e.stopPropagation(); setVisible(false); dismiss(); }}
              className={`p-1 rounded hover:bg-white/20 transition-colors ${
                hasError ? 'text-red-500' : 'text-green-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Body — only when expanded */}
      {!isMinimized && (
        <div className="px-3 py-3 space-y-2">
          {/* Status text */}
          <p className="text-xs text-slate-600 truncate">{statusText}</p>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ease-out ${barColor}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">{progress}%</span>
            {isUploading && (
              <button
                onClick={cancelUpload}
                className="text-[11px] text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* CSS animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
