
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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

  // Função separada para buscar dados do perfil/empresa
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Buscando perfil para usuário:', userId);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        setError('Erro ao carregar perfil do usuário.');
        return;
      }

      if (!profile) {
        console.error('Perfil não encontrado, criando novo perfil...');
        
        const { data: session } = await supabase.auth.getSession();
        const userEmail = session?.session?.user?.email;
        const userName = session?.session?.user?.user_metadata?.nome;
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            nome: userName || userEmail?.split('@')[0] || 'Usuário'
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar perfil:', createError);
          setError('Erro ao criar perfil de usuário.');
          return;
        }

        const userData: Usuario = {
          id: newProfile.id,
          nome: newProfile.nome,
          email: newProfile.email,
          empresaId: newProfile.empresa_id || null, // Garantir que seja null, não undefined
          avatarUrl: newProfile.avatar_url || null,
          cargo: newProfile.cargo || null,
          createdAt: newProfile.created_at
        };

        setUser(userData);
        return;
      }

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
        empresaId: profile.empresa_id || null, // Garantir que seja null, não undefined
        avatarUrl: profile.avatar_url || null,
        cargo: profile.cargo || null,
        createdAt: profile.created_at
      };

      setUser(userData);
    } catch (error: any) {
      console.error('Erro ao carregar dados do usuário:', error);
      setError(error.message || 'Erro ao carregar dados do usuário');
    }
  };

  useEffect(() => {
    // Timeout de segurança para garantir que loading seja false
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Configurar listener PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      setError(null);
      
      // Apenas operações síncronas aqui
      if (session?.user) {
        // Deferir busca de perfil com setTimeout
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setEmpresa(null);
      }
      
      // SEMPRE chamar setLoading(false) sincronamente
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
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

  const value = useMemo(() => ({
    user,
    empresa,
    loading,
    isLoading: loading, // Alias for compatibility
    error,
    login,
    logout,
    register,
    clearError,
  }), [user, empresa, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
