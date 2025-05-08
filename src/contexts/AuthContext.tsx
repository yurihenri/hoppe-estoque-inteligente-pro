
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Empresa, Usuario } from '@/types';
import { normalizeUsuario } from '@/utils/normalizeData';

interface AuthState {
  user: Usuario | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, empresa: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
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

        if (data) {
          // Convert Supabase data format to our app's Usuario type
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
          
          setAuthState(prev => ({ ...prev, user: userData }));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setAuthState(prev => ({ ...prev, user: null }));
      }
    });

    // Check initial session
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (email: string, password: string, nome: string, empresa: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            empresa,
          },
        },
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, error: error.message }));
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
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
