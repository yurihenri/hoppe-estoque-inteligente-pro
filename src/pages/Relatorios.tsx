
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Relatorios = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Layout title="Relatórios">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Relatórios do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="estoques">
              <TabsList className="mb-4">
                <TabsTrigger value="estoques">Estoques</TabsTrigger>
                <TabsTrigger value="validades">Validades</TabsTrigger>
                <TabsTrigger value="categorias">Categorias</TabsTrigger>
              </TabsList>
              
              <TabsContent value="estoques" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Relatório de estoques em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Esta seção permitirá visualizar e exportar relatórios detalhados sobre 
                    os níveis de estoque dos produtos.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="validades" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Relatório de validades em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Acompanhe produtos próximos ao vencimento e programe substituições
                    com antecedência.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="categorias" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Relatório por categorias em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Analise seus produtos por categoria para otimizar seu estoque
                    e identificar oportunidades.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
