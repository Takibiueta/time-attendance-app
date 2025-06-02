import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

// Initial admin credentials
const ADMIN_USERNAME = '上田直之';
const ADMIN_PASSWORD = 'uetanaoyuki26';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,

  login: async (username: string, password: string) => {
    // In a real app, this would be an API call
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const user = { username };
      
      // Store in localStorage for persistence
      localStorage.setItem('auth', JSON.stringify({ 
        isAuthenticated: true, 
        user 
      }));
      
      set({ isAuthenticated: true, user });
      return true;
    }
    
    return false;
  },

  logout: () => {
    localStorage.removeItem('auth');
    set({ isAuthenticated: false, user: null });
  },

  checkAuth: () => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const { isAuthenticated, user } = JSON.parse(auth);
        set({ isAuthenticated, user });
      } catch (error) {
        console.error('Failed to parse auth data:', error);
        localStorage.removeItem('auth');
      }
    }
  }
}));