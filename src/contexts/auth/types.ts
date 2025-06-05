
import { Usuario, Empresa } from '@/types';

export interface AuthContextType {
  user: Usuario | null;
  empresa: Empresa | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  clearError: () => void;
}
