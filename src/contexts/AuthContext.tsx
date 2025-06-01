
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

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          empresas:empresa_id (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        throw error;
      }

      console.log('Profile fetched successfully:', profile);

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
      console.error('Error fetching user profile:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Erro ao carregar perfil do usuário',
        isLoading: false 
      }));
    }
  };

  useEffect(() => {
    console.log('Setting up auth listener...');
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, user: null, error: null, isLoading: false }));
      }
    });

    // Check initial session
    const checkInitialSession = async () => {
      try {
        console.log('Checking initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          console.log('Initial session found:', session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('No initial session');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
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
      
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful for:', data.user?.id);
      // Auth state change listener will handle the rest
      
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
