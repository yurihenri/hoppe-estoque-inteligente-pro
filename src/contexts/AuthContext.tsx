
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
          console.log('Buscando perfil para usuário:', session.user.id);
          
          // Primeiro, verificar se o perfil existe
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('Erro ao buscar perfil:', profileError);
            throw new Error('Erro ao carregar perfil do usuário.');
          }

          if (!profile) {
            console.error('Perfil não encontrado para o usuário:', session.user.id);
            console.log('Verificando se o usuário existe na auth...');
            
            // Tentar criar o perfil se não existir
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                email: session.user.email,
                nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Usuário'
              })
              .select()
              .single();

            if (createError) {
              console.error('Erro ao criar perfil:', createError);
              setError('Erro ao criar perfil de usuário. Entre em contato com o suporte.');
              await supabase.auth.signOut();
              return;
            }

            console.log('Perfil criado com sucesso:', newProfile);
            
            // Usar o perfil recém-criado
            const userData: Usuario = {
              id: newProfile.id,
              nome: newProfile.nome,
              email: newProfile.email,
              empresaId: newProfile.empresa_id,
              avatarUrl: newProfile.avatar_url,
              cargo: newProfile.cargo,
              createdAt: newProfile.created_at
            };

            setUser(userData);
            setEmpresa(null); // Sem empresa ainda
            setLoading(false);
            return;
          }

          console.log('Perfil encontrado:', profile);

          // Se tem empresa_id, buscar dados da empresa
          if (profile.empresa_id) {
            const { data: empresa, error: empresaError } = await supabase
              .from('empresas')
              .select(`
                *,
                current_plan:plans(*)
              `)
              .eq('id', profile.empresa_id)
              .maybeSingle();

            if (empresaError) {
              console.error('Erro ao buscar empresa:', empresaError);
            }

            if (empresa) {
              const empresaData: Empresa = {
                id: empresa.id,
                nome: empresa.nome,
                cnpj: empresa.cnpj,
                segmento: empresa.segmento,
                currentPlan: empresa.current_plan ? {
                  ...empresa.current_plan,
                  features: convertJsonToFeatures(empresa.current_plan.features)
                } as Plan : undefined
              };
              setEmpresa(empresaData);
            }
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

          setUser(userData);
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
