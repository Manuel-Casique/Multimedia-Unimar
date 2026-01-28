import { create } from 'zustand';

interface SidebarState {
  isExpanded: boolean;
  isPinned: boolean;
  toggleSidebar: () => void;
  setExpanded: (expanded: boolean) => void;
  setPinned: (pinned: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: false,
  isPinned: false,
  toggleSidebar: () => set((state) => ({ 
    isPinned: !state.isPinned,
    isExpanded: !state.isPinned 
  })),
  setExpanded: (expanded) => set({ isExpanded: expanded }),
  setPinned: (pinned) => set({ isPinned: pinned, isExpanded: pinned }),
}));
