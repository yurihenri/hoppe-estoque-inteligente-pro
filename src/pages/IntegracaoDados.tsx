
import { useState } from 'react';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, Database, History, Upload } from 'lucide-react';
import UploadManual from '@/components/integracaoDados/UploadManual';
import IntegracaoAPI from '@/components/integracaoDados/IntegracaoAPI';
import HistoricoImportacoes from '@/components/integracaoDados/HistoricoImportacoes';

const IntegracaoDados = () => {
  return (
    <Layout title="Integração de Dados">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Integração de Dados</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Gerenciamento de Importações</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload size={18} /> Upload Manual
                </TabsTrigger>
                <TabsTrigger value="api" className="flex items-center gap-2">
                  <Database size={18} /> Integração API
                </TabsTrigger>
                <TabsTrigger value="historico" className="flex items-center gap-2">
                  <History size={18} /> Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <UploadManual />
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <IntegracaoAPI />
              </TabsContent>

              <TabsContent value="historico" className="space-y-4">
                <HistoricoImportacoes />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default IntegracaoDados;
