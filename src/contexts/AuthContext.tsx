
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
          // Fetch user profile with company and plan data
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
            .single();

          if (error) throw error;

          if (profile) {
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
          }
        } catch (error: any) {
          console.error('Erro ao carregar dados do usuário:', error);
          setError(error.message || 'Erro ao carregar dados do usuário');
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
      throw error;
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
    try {
      const { error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Erro ao registrar usuário');
      throw error;
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
