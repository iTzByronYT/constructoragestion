import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'VISUALIZER';
  phone: string | null;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;

        const permissions = {
          ADMIN: ['all'],
          MANAGER: ['create', 'read', 'update', 'delete'],
          ACCOUNTANT: ['create', 'read', 'update', 'delete'],
          VISUALIZER: ['read']
        };

        return permissions[user.role].includes('all') || 
               permissions[user.role].includes(permission);
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);