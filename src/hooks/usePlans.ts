
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plan, Subscription, PlanLimits, PlanFeatures } from '@/types/plans';
import { Json } from '@/integrations/supabase/types';

export const usePlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

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
    // Fallback for invalid data
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
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price_brl', { ascending: true });

        if (error) throw error;

        // Convert the data to proper Plan objects
        const normalizedPlans: Plan[] = (data || []).map(plan => ({
          ...plan,
          features: convertJsonToFeatures(plan.features)
        }));

        setPlans(normalizedPlans);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
      }
    };

    loadPlans();
  }, []);

  useEffect(() => {
    const loadCurrentSubscription = async () => {
      if (!user?.empresaId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            *,
            plan:plans(*)
          `)
          .eq('empresa_id', user.empresaId)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data && data.plan) {
          const normalizedSubscription: Subscription = {
            ...data,
            plan: {
              ...data.plan,
              features: convertJsonToFeatures(data.plan.features)
            }
          };
          setCurrentSubscription(normalizedSubscription);
          setCurrentPlan(normalizedSubscription.plan);
        } else {
          // Se não há assinatura ativa, buscar plano gratuito
          const freePlan = plans.find(p => p.type === 'free');
          if (freePlan) {
            setCurrentPlan(freePlan);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar assinatura atual:', error);
      } finally {
        setLoading(false);
      }
    };

    if (plans.length > 0) {
      loadCurrentSubscription();
    }
  }, [user?.empresaId, plans]);

  const checkPlanLimits = async (limitType: 'products' | 'users'): Promise<PlanLimits> => {
    if (!user?.empresaId) {
      return { allowed: false, reason: 'Usuário não autenticado' };
    }

    try {
      const { data, error } = await supabase.rpc('check_plan_limits', {
        empresa_uuid: user.empresaId,
        limit_type: limitType
      });

      if (error) throw error;

      // Safe type conversion
      if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
        return data as PlanLimits;
      }

      return { allowed: false, reason: 'Resposta inválida' };
    } catch (error) {
      console.error('Erro ao verificar limites do plano:', error);
      return { allowed: false, reason: 'Erro ao verificar limites' };
    }
  };

  const switchToPlan = async (planId: string): Promise<boolean> => {
    if (!user?.empresaId) return false;

    try {
      // For now, just update the empresa's current_plan_id
      // In a real implementation, this would involve payment processing
      const { error } = await supabase
        .from('empresas')
        .update({ current_plan_id: planId })
        .eq('id', user.empresaId);

      if (error) throw error;

      // Reload current subscription
      const newPlan = plans.find(p => p.id === planId);
      if (newPlan) {
        setCurrentPlan(newPlan);
      }

      return true;
    } catch (error) {
      console.error('Erro ao trocar plano:', error);
      return false;
    }
  };

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    return currentPlan?.features[feature] || false;
  };

  return {
    plans,
    currentSubscription,
    currentPlan,
    loading,
    checkPlanLimits,
    switchToPlan,
    hasFeature
  };
};
