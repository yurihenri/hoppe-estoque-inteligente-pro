
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Configuracoes = () => {
  return (
    <Layout title="Configurações">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Configurações</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>
              Gerencie as configurações do seu sistema Hoppe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="perfil">
              <TabsList className="mb-4">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                <TabsTrigger value="sistema">Sistema</TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Configurações de perfil em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Esta seção permitirá editar suas informações de perfil
                    e preferências de usuário.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="notificacoes" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Configurações de notificações em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Personalize quando e como deseja receber alertas
                    sobre produtos e estoques.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="sistema" className="space-y-4">
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-center">Configurações do sistema em desenvolvimento</p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Ajuste configurações gerais do sistema e parâmetros
                    de funcionamento.
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

export default Configuracoes;
