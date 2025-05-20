
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, ListChecks, History, Settings2 } from 'lucide-react';
import AlertRules from '@/components/alertas/AlertRules';
import AlertHistory from '@/components/alertas/AlertHistory';
import AlertSettings from '@/components/alertas/AlertSettings';
import ActiveAlerts from '@/components/alertas/ActiveAlerts';

const Alertas = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for new alerts on page load
    const checkAlerts = async () => {
      try {
        setLoading(true);
        // This will be implemented in the alerts service
        // We'll just simulate loading for now
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erro ao verificar alertas:', error);
        toast.error('Erro ao verificar alertas');
      }
    };
    
    checkAlerts();
  }, []);

  return (
    <Layout title="Alertas">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Sistema de Alertas</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="alertas-ativos">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="alertas-ativos" className="flex items-center gap-2">
                  <Bell size={18} /> Alertas Ativos
                </TabsTrigger>
                <TabsTrigger value="regras" className="flex items-center gap-2">
                  <Settings2 size={18} /> Regras
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2">
                  <History size={18} /> Histórico
                </TabsTrigger>
                <TabsTrigger value="configuracoes" className="flex items-center gap-2">
                  <ListChecks size={18} /> Configurações
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alertas-ativos" className="space-y-4">
                <ActiveAlerts loading={loading} />
              </TabsContent>

              <TabsContent value="regras" className="space-y-4">
                <AlertRules />
              </TabsContent>

              <TabsContent value="historico" className="space-y-4">
                <AlertHistory />
              </TabsContent>

              <TabsContent value="configuracoes" className="space-y-4">
                <AlertSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Alertas;
