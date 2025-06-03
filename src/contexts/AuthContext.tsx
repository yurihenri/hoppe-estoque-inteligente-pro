
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario, Empresa } from '@/types';
import { Plan, PlanFeatures } from '@/types/plans';
import { Json } from '@/integrations/supabase/types';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to sanitize email
const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Helper function to convert Json to PlanFeatures
  const convertJsonToFeatures = (features: Json): PlanFeatures => {
    if (typeof features === 'object' && features !== null && !Array.isArray(features)) {
      const obj = features as { [key: string]: any };
      return {
        reports: obj.reports || false,
        exports: obj.exports || false,
        integrations: obj.integrations || false,
        email_alerts: obj.email_alerts || true,
        app_notifications: obj.app_notifications || false,
        advanced_dashboard: obj.advanced_dashboard || false,
        remove_branding: obj.remove_branding || false
      };
    }
    return {
      reports: false,
      exports: false,
      integrations: false,
      email_alerts: true,
      app_notifications: false,
      advanced_dashboard: false,
      remove_branding: false
    };
  };

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
      const sanitizedEmail = sanitizeEmail(email);
      console.log('Tentativa de login com email:', sanitizedEmail);

      // Verificar se o email existe antes de tentar fazer login
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (profileError) {
        console.error('Erro ao verificar perfil:', profileError);
        throw new Error('Erro interno. Tente novamente.');
      }

      if (!profileCheck) {
        console.log('Email não encontrado na base de dados:', sanitizedEmail);
        throw new Error('Email não encontrado. Verifique seus dados ou cadastre-se.');
      }

      console.log('Email encontrado, tentando fazer login...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });
      
      if (error) {
        console.error('Erro de autenticação:', error);
        
        // Mensagens de erro mais amigáveis
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos. Verifique seus dados e tente novamente.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Verifique sua caixa de entrada.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Muitas tentativas de login. Aguarde alguns minutos e tente novamente.');
        } else {
          throw new Error('Erro ao fazer login. Tente novamente.');
        }
      }

      if (!data.user) {
        throw new Error('Falha na autenticação. Tente novamente.');
      }

      console.log('Login realizado com sucesso!');

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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const register = async (userData: any) => {
    setError(null);
    setLoading(true);
    
    try {
      const sanitizedEmail = sanitizeEmail(userData.email);
      console.log('Tentativa de registro com email:', sanitizedEmail);

      // Verificar se o email já está cadastrado
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', sanitizedEmail)
        .maybeSingle();

      if (checkError) {
        console.error('Erro ao verificar email existente:', checkError);
        throw new Error('Erro interno. Tente novamente.');
      }

      if (existingProfile) {
        console.log('Email já existe na base de dados:', sanitizedEmail);
        throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
      }

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: userData.password,
        options: {
          data: {
            nome: userData.nome,
            empresa: userData.empresa
          }
        }
      });
      
      if (error) {
        console.error('Erro no registro:', error);
        
        // Mensagens de erro mais amigáveis para registro
        if (error.message.includes('User already registered')) {
          throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Email inválido. Verifique o formato do email.');
        } else {
          throw new Error('Erro ao criar conta. Tente novamente.');
        }
      }
      
      console.log('Registro realizado com sucesso!');
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
