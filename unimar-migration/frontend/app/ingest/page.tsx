'use client';

import { useState } from 'react';
import { useIngestStore, IngestFile } from '@/stores/useIngestStore';
import AdminLayout from '@/components/AdminLayout';
import DropZone from '@/components/DropZone';
import FileList from '@/components/FileList';
import IngestSidebar from '@/components/IngestSidebar';
import EditMetadataModal from '@/components/EditMetadataModal';

export default function IngestPage() {
  const { files, clearAll } = useIngestStore();
  const [editingFile, setEditingFile] = useState<IngestFile | null>(null);

  return (
    <AdminLayout 
      pageTitle="Bandeja de Preparación" 
      pageDescription="Gestiona los archivos multimedia antes de publicar"
    >
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* DropZone Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-sm font-semibold text-[#30669a] uppercase tracking-wide mb-4">
              Subir Archivos
            </h3>
            <DropZone className="min-h-[180px]" />
          </div>

          {/* File List Card */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#30669a] uppercase tracking-wide">
                  Archivos Cargados
                </h3>
                <button
                  onClick={clearAll}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
                >
                  LIMPIAR TODO
                </button>
              </div>
              <FileList onEdit={setEditingFile} />
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1">
          <IngestSidebar />
        </div>
      </div>

      {/* Modal */}
      <EditMetadataModal 
        file={editingFile} 
        onClose={() => setEditingFile(null)} 
      />
    </AdminLayout>
  );
}
