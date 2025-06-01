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
    let timeoutId: NodeJS.Timeout;

    const fetchUserProfile = async (userId: string) => {
      try {
        console.log('Fetching user profile for:', userId);
        
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

        if (error) {
          console.error('Profile fetch error:', error);
          throw error;
        }

        if (data && isMounted) {
          console.log('Profile data loaded:', data);
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
          
          setAuthState(prev => ({ ...prev, user: userData, error: null, isLoading: false }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        if (isMounted) {
          setAuthState(prev => ({ 
            ...prev, 
            error: 'Erro ao carregar perfil do usuário',
            isLoading: false 
          }));
        }
      }
    };

    // Timeout para evitar carregamento infinito
    const setAuthTimeout = () => {
      timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('Auth timeout reached');
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: prev.user ? null : 'Tempo limite de autenticação excedido'
          }));
        }
      }, 8000); // 8 segundos de timeout
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log('Auth state changed:', event, session?.user?.id);
      
      // Limpa timeout anterior
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        setAuthTimeout();
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, user: null, error: null, isLoading: false }));
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token foi renovado, mas usuário já existe
        if (!authState.user) {
          setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
          setAuthTimeout();
          await fetchUserProfile(session.user.id);
        }
      }
    });

    // Check initial session
    const checkUser = async () => {
      try {
        console.log('Checking initial session...');
        setAuthTimeout();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          throw error;
        }
        
        if (session?.user && isMounted) {
          console.log('Initial session found:', session.user.id);
          setAuthState(prev => ({ ...prev, isLoading: true }));
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No initial session found');
          if (isMounted) {
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        if (isMounted) {
          setAuthState(prev => ({ 
            ...prev, 
            error: 'Erro ao verificar sessão',
            isLoading: false 
          }));
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful:', data.user?.id);
      // O auth state change vai lidar com o resto
      
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
