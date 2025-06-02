
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plan, Subscription, PlanLimits } from '@/types/plans';
import { toast } from 'sonner';

export const usePlans = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar todos os planos disponíveis
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price_brl');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  // Buscar assinatura atual da empresa
  const fetchCurrentSubscription = async () => {
    if (!user?.empresaId) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plan:plan_id (*)
        `)
        .eq('empresa_id', user.empresaId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setCurrentSubscription(data);
        setCurrentPlan(data.plan as Plan);
      } else {
        // Se não há assinatura, buscar plano atual da empresa
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select(`
            current_plan_id,
            plans:current_plan_id (*)
          `)
          .eq('id', user.empresaId)
          .single();

        if (empresaError) throw empresaError;
        if (empresaData?.plans) {
          setCurrentPlan(empresaData.plans as Plan);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar assinatura atual:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verificar limites do plano
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
      return data as PlanLimits;
    } catch (error) {
      console.error('Erro ao verificar limites do plano:', error);
      return { allowed: false, reason: 'Erro ao verificar limites' };
    }
  };

  // Verificar se uma funcionalidade está disponível
  const hasFeature = (feature: keyof Plan['features']): boolean => {
    return currentPlan?.features[feature] || false;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (user?.empresaId) {
      fetchCurrentSubscription();
    }
  }, [user?.empresaId]);

  return {
    plans,
    currentSubscription,
    currentPlan,
    loading,
    checkPlanLimits,
    hasFeature,
    refetch: () => {
      fetchPlans();
      fetchCurrentSubscription();
    }
  };
};
