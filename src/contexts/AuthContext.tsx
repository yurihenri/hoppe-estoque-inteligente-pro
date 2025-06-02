
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Empresa, Usuario } from '@/types';
import { secureStorage } from '@/utils/secureStorage';

interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, nome: string, empresa: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          empresas:empresa_id (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      const userData: Usuario = {
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        empresaId: profile.empresa_id,
        avatarUrl: profile.avatar_url || undefined,
        cargo: profile.cargo || undefined,
        createdAt: profile.created_at,
        empresa: profile.empresas ? {
          id: profile.empresas.id,
          nome: profile.empresas.nome,
          cnpj: profile.empresas.cnpj || undefined,
          segmento: profile.empresas.segmento || undefined
        } : undefined
      };
      
      setAuthState(prev => ({ 
        ...prev, 
        user: userData, 
        error: null, 
        isLoading: false 
      }));

    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Erro ao carregar perfil do usuário',
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, user: null, error: null, isLoading: false }));
        secureStorage.clear(); // Clear all secure storage on logout
      }
    });

    // Check initial session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ 
          ...prev, 
          error: 'Erro ao verificar sessão',
          isLoading: false 
        }));
      }
    };

    checkInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        throw error;
      }
      
      // Auth state change listener will handle the rest
      
    } catch (error: any) {
      let errorMessage = "Erro ao fazer login. Tente novamente.";
      
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Email ou senha incorretos.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Por favor, confirme seu email antes de fazer login.";
        } else if (error.message.includes('Too many requests')) {
          errorMessage = "Muitas tentativas. Tente novamente em alguns minutos.";
        }
      }
      
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, nome: string, empresa: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome: nome.trim(),
            empresa: empresa.trim(),
          },
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      
      if (error?.message) {
        if (error.message.includes('already registered')) {
          errorMessage = "Este email já está cadastrado.";
        }
      }
      
      setAuthState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear secure storage instead of localStorage
      secureStorage.clear();
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: 'Erro ao fazer logout' }));
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
