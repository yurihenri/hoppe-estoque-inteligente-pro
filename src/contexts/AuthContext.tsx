
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/types';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { AuthState, Credentials, RegisterData } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: Credentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({ ...prev, isLoading: true }));
        
        if (session && session.user) {
          try {
            // Fetch user profile data
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*, empresas:empresa_id(*)')
              .eq('id', session.user.id)
              .single();

            if (profileError) throw profileError;

            setAuthState({
              user: profile as Usuario,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error('Error fetching user profile:', error);
            setAuthState({
              user: null,
              isLoading: false,
              error: error.message,
            });
          }
        } else {
          setAuthState({
            user: null,
            isLoading: false,
            error: null,
          });
        }

        if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    // Initial session check
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setAuthState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (credentials: Credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword(credentials);
      
      if (error) throw error;
      
      toast('Login realizado com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao fazer login'
      }));
      toast(error.message || 'Erro ao fazer login', {
        description: 'Verifique suas credenciais e tente novamente.'
      });
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            empresa: data.empresa
          }
        }
      });
      
      if (error) throw error;
      
      toast('Conta criada com sucesso');
      navigate('/dashboard');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Erro ao criar conta'
      }));
      toast(error.message || 'Erro ao criar conta', {
        description: 'Verifique suas informações e tente novamente.'
      });
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setAuthState({
        user: null,
        isLoading: false,
        error: null
      });
      
      toast('Logout realizado com sucesso');
      navigate('/login');
    } catch (error: any) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      toast(error.message || 'Erro ao fazer logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout
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
