
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Empresa, Usuario } from '@/types';

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

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            empresas:empresa_id (
              *
            )
          `)
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data && isMounted) {
          const userData: Usuario = {
            id: data.id,
            nome: data.nome,
            email: data.email,
            empresaId: data.empresa_id,
            avatarUrl: data.avatar_url || undefined,
            cargo: data.cargo || undefined,
            createdAt: data.created_at,
            empresa: data.empresas ? {
              id: data.empresas.id,
              nome: data.empresas.nome,
              cnpj: data.empresas.cnpj || undefined,
              segmento: data.empresas.segmento || undefined
            } : undefined
          };
          
          setAuthState(prev => ({ ...prev, user: userData, error: null }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, error: 'Erro ao carregar perfil do usuário' }));
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        await fetchUserProfile(session.user.id);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, user: null, error: null, isLoading: false }));
      }
    });

    // Check initial session
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user && isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: true }));
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        if (isMounted) {
          setAuthState(prev => ({ ...prev, error: 'Erro ao verificar sessão' }));
        }
      } finally {
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
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
      
      if (error) throw error;
      
      // The auth state change will handle the rest
    } catch (error: any) {
      console.error('Login error:', error);
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
      console.error('Register error:', error);
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
      
      localStorage.removeItem('hoppe_remember_me');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error('Logout error:', error);
      setAuthState(prev => ({ ...prev, error: 'Erro ao fazer logout' }));
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
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
