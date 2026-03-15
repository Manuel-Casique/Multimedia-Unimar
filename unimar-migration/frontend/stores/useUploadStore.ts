import { create } from 'zustand';
import api from '@/lib/api';

export interface UploadFileData {
  file: File;
  title: string;
  description?: string;
  tags?: string[];
  authors?: any[];
  date_taken?: string;
  location?: string;
}

interface UploadState {
  isUploading: boolean;
  isComplete: boolean;
  isMinimized: boolean;
  hasError: boolean;
  errorMessage: string;
  progress: number;          // 0-100
  totalFiles: number;
  currentFileIndex: number;  // 1-based
  currentFileName: string;
  cancelRequested: boolean;

  // Actions
  startUpload: (files: UploadFileData[], onComplete?: () => void) => Promise<void>;
  cancelUpload: () => void;
  dismiss: () => void;
  toggleMinimize: () => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>((set, get) => ({
  isUploading: false,
  isComplete: false,
  isMinimized: false,
  hasError: false,
  errorMessage: '',
  progress: 0,
  totalFiles: 0,
  currentFileIndex: 0,
  currentFileName: '',
  cancelRequested: false,

  startUpload: async (files: UploadFileData[], onComplete?: () => void) => {
    if (get().isUploading) return;

    set({
      isUploading: true,
      isComplete: false,
      isMinimized: false,
      hasError: false,
      errorMessage: '',
      progress: 0,
      totalFiles: files.length,
      currentFileIndex: 0,
      currentFileName: '',
      cancelRequested: false,
    });

    let totalBytes = 0;
    files.forEach(f => totalBytes += f.file.size);
    let uploadedBytes = 0;

    try {
      for (let fi = 0; fi < files.length; fi++) {
        if (get().cancelRequested) {
          set({ isUploading: false, hasError: true, errorMessage: 'Subida cancelada por el usuario.' });
          return;
        }

        const fileData = files[fi];
        const file = fileData.file;

        set({
          currentFileIndex: fi + 1,
          currentFileName: fileData.title || file.name,
        });

        const chunkSize = 5 * 1024 * 1024; // 5MB per chunk
        const totalChunks = Math.ceil(file.size / chunkSize);
        const fileId = Math.random().toString(36).substring(2) + Date.now().toString(36);

        for (let i = 0; i < totalChunks; i++) {
          if (get().cancelRequested) {
            set({ isUploading: false, hasError: true, errorMessage: 'Subida cancelada por el usuario.' });
            return;
          }

          const start = i * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('file', chunk);
          formData.append('file_id', fileId);
          formData.append('chunk_index', i.toString());
          formData.append('total_chunks', totalChunks.toString());
          formData.append('file_name', file.name);
          formData.append('mime_type', file.type);

          // Send metadata only on the last chunk
          if (i === totalChunks - 1) {
            const authorsIds = Array.isArray(fileData.authors)
              ? fileData.authors.map((a: any) => a.id)
              : [];
            formData.append('file_metadata', JSON.stringify({
              title: fileData.title,
              description: fileData.description,
              tags: fileData.tags,
              authors: authorsIds,
              date_taken: fileData.date_taken,
              location: fileData.location,
            }));
          }

          // Retry logic: single-threaded php artisan serve can be busy with page API calls
          const MAX_RETRIES = 5;
          let lastError: any = null;
          for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
              await api.post('/ingest/upload-chunk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 0,
              });
              lastError = null;
              break; // success, exit retry loop
            } catch (err: any) {
              lastError = err;
              if (attempt < MAX_RETRIES) {
                // Exponential backoff: 1s, 2s, 4s, 8s, 16s
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`Chunk ${i} upload attempt ${attempt + 1} failed, retrying in ${delay}ms...`, err.message);
                await new Promise(resolve => setTimeout(resolve, delay));
                // Check if cancel was requested during the wait
                if (get().cancelRequested) {
                  set({ isUploading: false, hasError: true, errorMessage: 'Subida cancelada por el usuario.' });
                  return;
                }
              }
            }
          }
          if (lastError) {
            throw lastError; // All retries exhausted
          }

          uploadedBytes += chunk.size;
          const percentCompleted = Math.round((uploadedBytes / totalBytes) * 100);
          set({ progress: percentCompleted });
        }
      }

      set({ isUploading: false, isComplete: true, progress: 100 });
      onComplete?.();
    } catch (error: any) {
      console.error('Upload failed:', error);
      set({
        isUploading: false,
        hasError: true,
        errorMessage: error?.response?.data?.message || 'Hubo un problema al subir los archivos.',
      });
    }
  },

  cancelUpload: () => set({ cancelRequested: true }),

  dismiss: () => set({
    isComplete: false,
    hasError: false,
    errorMessage: '',
    progress: 0,
    totalFiles: 0,
    currentFileIndex: 0,
    currentFileName: '',
  }),

  toggleMinimize: () => set(s => ({ isMinimized: !s.isMinimized })),

  reset: () => set({
    isUploading: false,
    isComplete: false,
    isMinimized: false,
    hasError: false,
    errorMessage: '',
    progress: 0,
    totalFiles: 0,
    currentFileIndex: 0,
    currentFileName: '',
    cancelRequested: false,
  }),
}));
