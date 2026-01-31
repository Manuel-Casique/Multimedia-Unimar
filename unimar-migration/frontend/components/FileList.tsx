'use client';

import { useIngestStore, IngestFile } from '@/stores/useIngestStore';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  } else if (type.startsWith('video/')) {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  } else {
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  }
}

interface FileListProps {
  onEdit: (file: IngestFile) => void;
}

interface FileItemProps {
  file: IngestFile;
  isSelected: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

function FileItem({ file, isSelected, onToggle, onEdit }: FileItemProps) {
  const { removeFile } = useIngestStore();

  return (
    <div
      className={`
        group relative flex items-center gap-4 p-3 rounded-xl border transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'bg-unimar-light/10 border-unimar-light/30 ring-2 ring-unimar-light/20'
          : 'bg-white/60 border-slate-100 hover:bg-slate-50/80 hover:border-slate-200'
        }
      `}
      onClick={onToggle}
    >
      {/* Checkbox */}
      <div className="relative flex-shrink-0">
        <div className={`
          w-5 h-5 rounded border-2 flex items-center justify-center transition-all
          ${isSelected ? 'bg-unimar-light border-unimar-light' : 'border-slate-300 bg-white'}
        `}>
          {isSelected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
        {file.preview ? (
          <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-slate-400">
            {getFileIcon(file.type)}
          </div>
        )}
      </div>

      {/* Info / Edit Mode */}
      <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
        <div className="group/edit flex items-center gap-2">
          <p className="font-medium text-slate-700 truncate text-sm" title={file.title}>
            {file.title}
          </p>
          <button
            onClick={onEdit}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-unimar-light transition-all opacity-0 group-hover/edit:opacity-100"
            title="Editar detalles"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 flex gap-2">
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
          {file.category && (
             <>
               <span>•</span>
               <span className="text-unimar-light font-medium">{file.category}</span>
             </>
          )}
        </p>
      </div>

      {/* Status Indicator */}
      {file.status === 'uploading' && (
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-unimar-light border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {file.status === 'uploaded' && (
        <div className="w-8 h-8 flex items-center justify-center text-green-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      {file.status === 'error' && (
        <div className="w-8 h-8 flex items-center justify-center text-red-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFile(file.id);
        }}
        className="opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function FileList({ onEdit }: FileListProps) {
  const { files, selectedIds, toggleSelect, selectAll, deselectAll } = useIngestStore();

  if (files.length === 0) {
    return null;
  }

  const allSelected = files.length > 0 && selectedIds.length === files.length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <button
            onClick={allSelected ? deselectAll : selectAll}
            className="text-sm font-medium text-unimar-light hover:text-unimar-dark transition-colors"
          >
            {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
              {selectedIds.length} de {files.length}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {files.length} archivo{files.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* File Items */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            isSelected={selectedIds.includes(file.id)}
            onToggle={() => toggleSelect(file.id)}
            onEdit={() => onEdit(file)}
          />
        ))}
      </div>
    </div>
  );
}
