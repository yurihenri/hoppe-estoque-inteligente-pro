
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario, Empresa } from '@/types';
import { Plan } from '@/types/plans';
import { AuthContextType } from './auth/types';
import { convertJsonToFeatures } from './auth/utils';
import { useAuthLogin, useAuthRegister, useAuthLogout } from './auth/hooks';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { login: loginHook } = useAuthLogin();
  const { register: registerHook } = useAuthRegister();
  const { logout: logoutHook } = useAuthLogout();

  const clearError = () => setError(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setError(null);
      
      if (session?.user) {
        try {
          // Usar maybeSingle() em vez de single() para evitar erros com múltiplos registros
          const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
              *,
              empresa:empresas!inner(
                *,
                current_plan:plans(*)
              )
            `)
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Erro na query do perfil:', error);
            throw new Error('Erro ao carregar dados do usuário. Tente fazer login novamente.');
          }

          if (!profile) {
            console.error('Perfil não encontrado para o usuário:', session.user.id);
            setError('Perfil de usuário não encontrado. Entre em contato com o suporte.');
            await supabase.auth.signOut();
            return;
          }

          if (!profile.empresa) {
            console.error('Empresa não encontrada para o usuário:', session.user.id);
            setError('Dados da empresa não encontrados. Entre em contato com o suporte.');
            await supabase.auth.signOut();
            return;
          }

          const userData: Usuario = {
            id: profile.id,
            nome: profile.nome,
            email: profile.email,
            empresaId: profile.empresa_id,
            avatarUrl: profile.avatar_url,
            cargo: profile.cargo,
            createdAt: profile.created_at
          };

          const empresaData: Empresa = {
            id: profile.empresa.id,
            nome: profile.empresa.nome,
            cnpj: profile.empresa.cnpj,
            segmento: profile.empresa.segmento,
            currentPlan: profile.empresa.current_plan ? {
              ...profile.empresa.current_plan,
              features: convertJsonToFeatures(profile.empresa.current_plan.features)
            } as Plan : undefined
          };

          setUser(userData);
          setEmpresa(empresaData);
        } catch (error: any) {
          console.error('Erro ao carregar dados do usuário:', error);
          setError(error.message || 'Erro ao carregar dados do usuário');
          // Fazer logout em caso de erro crítico
          await supabase.auth.signOut();
        }
      } else {
        setUser(null);
        setEmpresa(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    
    try {
      await loginHook(email, password);
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await logoutHook();
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const register = async (userData: any) => {
    setError(null);
    setLoading(true);
    
    try {
      await registerHook(userData);
    } catch (error: any) {
      setError(error.message || 'Erro ao registrar usuário');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    empresa,
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    login,
    logout,
    register,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
