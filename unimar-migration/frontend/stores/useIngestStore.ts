import { create } from 'zustand';

export interface IngestFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string | null;
  title: string;
  description: string;
  category: string;
  tags: string[];
  date_taken?: string;
  author?: string;
  location?: string;
  status: 'pending' | 'uploading' | 'uploaded' | 'error';
  progress: number;
}

interface IngestState {
  files: IngestFile[];
  selectedIds: string[];
  isUploading: boolean;
  
  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  removeSelected: () => void;
  clearAll: () => void;
  
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  updateFileMetadata: (id: string, data: Partial<Pick<IngestFile, 'title' | 'description' | 'category' | 'tags' | 'date_taken' | 'author' | 'location'>>) => void;
  updateSelectedMetadata: (data: Partial<Pick<IngestFile, 'title' | 'description' | 'category' | 'tags' | 'date_taken' | 'author' | 'location'>>) => void;
  
  setFileStatus: (id: string, status: IngestFile['status'], progress?: number) => void;
  setUploading: (value: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const getPreview = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadeddata = () => {
        video.currentTime = 1;
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve(null);
      video.src = URL.createObjectURL(file);
    } else {
      resolve(null);
    }
  });
};

const extractMetadata = async (file: File) => {
  if (!file.type.startsWith('image/')) return {};
  
  try {
    const { default: exifr } = await import('exifr'); // Dynamic import
    const data = await exifr.parse(file);
    
    if (!data) return {};

    const metadata: any = {};
    if (data.DateTimeOriginal) metadata.date_taken = data.DateTimeOriginal.toISOString();
    if (data.Artist || data.XPAuthor) metadata.author = data.Artist || data.XPAuthor;
    if (data.Copyright) metadata.copyright = data.Copyright;
    if (data.latitude && data.longitude) {
      metadata.location = `${data.latitude}, ${data.longitude}`;
    }
    
    return metadata;
  } catch (err) {
    console.warn('Error extracting metadata', err);
    return {};
  }
};

export const useIngestStore = create<IngestState>((set, get) => ({
  files: [],
  selectedIds: [],
  isUploading: false,

  addFiles: async (newFiles: File[]) => {
    const filePromises = newFiles.map(async (file) => {
      const preview = await getPreview(file);
      const extracted = await extractMetadata(file);

      return {
        id: generateId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        category: '',
        tags: [],
        date_taken: extracted.date_taken || '',
        author: extracted.author || '',
        location: extracted.location || '',
        status: 'pending' as const,
        progress: 0,
      };
    });
    
    const processedFiles = await Promise.all(filePromises);
    set((state) => ({
      files: [...state.files, ...processedFiles],
    }));
  },

  removeFile: (id) => set((state) => ({
    files: state.files.filter((f) => f.id !== id),
    selectedIds: state.selectedIds.filter((sid) => sid !== id),
  })),

  removeSelected: () => set((state) => ({
    files: state.files.filter((f) => !state.selectedIds.includes(f.id)),
    selectedIds: [],
  })),

  clearAll: () => set({ files: [], selectedIds: [] }),

  toggleSelect: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((sid) => sid !== id)
      : [...state.selectedIds, id],
  })),

  selectAll: () => set((state) => ({
    selectedIds: state.files.map((f) => f.id),
  })),

  deselectAll: () => set({ selectedIds: [] }),

  updateFileMetadata: (id, data) => set((state) => ({
    files: state.files.map((f) =>
      f.id === id ? { ...f, ...data } : f
    ),
  })),

  updateSelectedMetadata: (data) => set((state) => ({
    files: state.files.map((f) =>
      state.selectedIds.includes(f.id) ? { ...f, ...data } : f
    ),
  })),

  setFileStatus: (id, status, progress = 0) => set((state) => ({
    files: state.files.map((f) =>
      f.id === id ? { ...f, status, progress } : f
    ),
  })),

  setUploading: (value) => set({ isUploading: value }),
}));
