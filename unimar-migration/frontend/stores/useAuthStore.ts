import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  google_id?: string | null;
  avatar?: string | null;
  profile_photo_path?: string | null;
  profile_photo_url?: string | null;
  role?: { id: number; name: string; description?: string };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
  isAdmin: () => boolean;
  isEditor: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false });
      },
      
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      isAdmin: () => {
        const user = get().user;
        if (user && user.role) {
          return user.role.name === 'admin';
        }
        // Fallback for old cached states
        if (user && (user as any).roles && (user as any).roles.length > 0) {
           return (user as any).roles.some((r: any) => r.name === 'admin');
        }
        return false;
      },

      isEditor: () => {
        const user = get().user;
        if (user && user.role) {
          return user.role.name === 'editor' || user.role.name === 'admin';
        }
        // Fallback for old cached states
        if (user && (user as any).roles && (user as any).roles.length > 0) {
           return (user as any).roles.some((r: any) => r.name === 'editor' || r.name === 'admin');
        }
        return false;
      }
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
