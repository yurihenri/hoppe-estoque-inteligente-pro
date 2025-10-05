
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, Package, Users, Bell, Zap, Mail, MessageCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Planos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectFreePlan = async () => {
    if (!user) {
      // Redirect to register with free plan
      navigate('/register?plan=free');
      return;
    }

    setLoading(true);
    try {
      // Buscar o ID do plano gratuito
      const { data: freePlan, error: planError } = await supabase
        .from('plans')
        .select('id')
        .eq('type', 'free')
        .single();

      if (planError) throw planError;
      if (!freePlan) {
        toast.error('Plano gratuito não encontrado');
        return;
      }

      // Update user's company plan to free
      const { error } = await supabase
        .from('empresas')
        .update({ current_plan_id: freePlan.id })
        .eq('id', user.empresaId);

      if (error) throw error;

      toast.success('Plano gratuito ativado com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar plano gratuito:', error);
      toast.error('Erro ao ativar plano gratuito');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProPlan = async () => {
    if (!user) {
      // Redirect to register with pro plan
      navigate('/register?plan=pro');
      return;
    }

    setLoading(true);
    try {
      // Here you would integrate with Stripe for payment
      // For now, we'll just show a message
      toast.info('Redirecionando para checkout de pagamento...');
      
      // TODO: Integrate with Stripe checkout
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ planType: 'pro' })
      // });
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Planos">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para sua empresa
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gerencie seu estoque de forma inteligente com nossos planos flexíveis
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Plano Gratuito</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-gray-900">R$ 0,00</span>
                <span className="text-gray-600 ml-2">/ mês</span>
              </div>
              <p className="text-gray-600 mt-2">Perfeito para começar</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Cadastro de até 50 produtos</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">1 usuário administrador</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Alertas de vencimento limitados (5/mês)</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">Suporte básico via e-mail</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg font-semibold"
                variant="outline"
                onClick={handleSelectFreePlan}
                disabled={loading}
              >
                Começar agora
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 hover:border-blue-600 transition-all duration-300 hover:shadow-xl shadow-lg">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Mais Popular
              </div>
            </div>

            <CardHeader className="text-center pb-8 pt-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">Plano Profissional</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">R$ 39,90</span>
                <span className="text-gray-600 ml-2">/ mês</span>
              </div>
              <p className="text-gray-600 mt-2">Para empresas em crescimento</p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">Cadastro ilimitado de produtos</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">Até 3 usuários simultâneos</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">Alertas de vencimento ilimitados</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">Integração com APIs externas</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-700 font-medium">Suporte por e-mail e WhatsApp</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                onClick={handleSelectProPlan}
                disabled={loading}
              >
                Assinar plano
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Todos os planos incluem segurança de dados e atualizações automáticas
          </p>
          <p className="text-sm text-gray-500">
            Powered by Hoppe - Gestão Inteligente de Estoque
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Planos;
