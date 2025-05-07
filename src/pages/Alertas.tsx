
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Alertas = () => {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulating loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout title="Alertas">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Alertas</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Sistema de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Carregando alertas...</p>
            ) : (
              <p className="text-center py-4">
                Sistema de alertas em construção. Esta funcionalidade permitirá monitorar produtos próximos 
                ao vencimento e criar regras de notificação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Alertas;
