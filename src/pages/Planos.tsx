
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlanBadge } from '@/components/plans/PlanBadge';
import { PlanLimits } from '@/components/plans/PlanLimits';
import { usePlans } from '@/hooks/usePlans';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Crown, Zap } from 'lucide-react';

const Planos = () => {
  const { user } = useAuth();
  const { plans, currentPlan, loading } = usePlans();
  const [currentProducts, setCurrentProducts] = useState(0);
  const [currentUsers, setCurrentUsers] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.empresaId) return;

      try {
        // Contar produtos
        const { count: productsCount, error: productsError } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', user.empresaId);

        if (productsError) throw productsError;

        // Contar usuários
        const { count: usersCount, error: usersError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('empresa_id', user.empresaId);

        if (usersError) throw usersError;

        setCurrentProducts(productsCount || 0);
        setCurrentUsers(usersCount || 0);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        toast.error('Erro ao carregar estatísticas de uso');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user?.empresaId]);

  const handleUpgradePlan = async (planId: string) => {
    if (!user?.empresaId) return;

    try {
      const { error } = await supabase
        .from('empresas')
        .update({ current_plan_id: planId })
        .eq('id', user.empresaId);

      if (error) throw error;

      toast.success('Plano atualizado com sucesso!');
      // Recarregar a página para atualizar o contexto
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano');
    }
  };

  if (loading || loadingStats) {
    return (
      <Layout title="Planos">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Carregando...</h3>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Planos">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Planos</h1>
          {currentPlan && <PlanBadge plan={currentPlan} />}
        </div>

        {currentPlan && (
          <PlanLimits 
            plan={currentPlan} 
            currentProducts={currentProducts}
            currentUsers={currentUsers}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const isPro = plan.type === 'pro';

            return (
              <Card key={plan.id} className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}>
                {isCurrentPlan && (
                  <Badge className="absolute -top-2 left-4 bg-blue-500">
                    Plano Atual
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {isPro ? <Crown className="h-8 w-8 text-yellow-500" /> : <Zap className="h-8 w-8 text-blue-500" />}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-2xl font-bold">
                    {plan.price_brl > 0 ? (
                      <>
                        R$ {plan.price_brl.toFixed(2)}
                        <span className="text-sm font-normal text-gray-600">/mês</span>
                      </>
                    ) : (
                      'Gratuito'
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">Até {plan.max_products} produtos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="text-sm">Até {plan.max_users} usuário(s)</span>
                    </div>
                    {plan.features.email_alerts && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Alertas por e-mail</span>
                      </div>
                    )}
                    {plan.features.app_notifications && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Notificações no app</span>
                      </div>
                    )}
                    {plan.features.reports && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Relatórios avançados</span>
                      </div>
                    )}
                    {plan.features.exports && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Exportação CSV</span>
                      </div>
                    )}
                    {plan.features.advanced_dashboard && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Dashboard avançado</span>
                      </div>
                    )}
                    {plan.features.integrations && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Integrações externas</span>
                      </div>
                    )}
                    {plan.features.remove_branding && (
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="text-sm">Sem marca "Powered by Hoppe"</span>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isCurrentPlan}
                    onClick={() => handleUpgradePlan(plan.id)}
                  >
                    {isCurrentPlan ? "Plano Atual" : isPro ? "Fazer Upgrade" : "Selecionar Plano"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!currentPlan?.features.remove_branding && (
          <div className="text-center py-4 border-t">
            <p className="text-sm text-gray-500">Powered by Hoppe</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Planos;
