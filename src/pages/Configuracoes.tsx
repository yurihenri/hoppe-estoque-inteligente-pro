
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from '@supabase/supabase-js';

// Import our new components
import ProfileSettings from '@/components/configuracoes/ProfileSettings';
import NotificationSettings from '@/components/configuracoes/NotificationSettings';
import SystemSettings from '@/components/configuracoes/SystemSettings';
import SecuritySettings from '@/components/configuracoes/SecuritySettings';

const Configuracoes = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load user data on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
                <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              </TabsList>
              
              <TabsContent value="perfil" className="space-y-4">
                {loading ? (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-center">Carregando informações do perfil...</p>
                  </div>
                ) : (
                  <ProfileSettings user={user} />
                )}
              </TabsContent>
              
              <TabsContent value="notificacoes" className="space-y-4">
                <NotificationSettings />
              </TabsContent>
              
              <TabsContent value="sistema" className="space-y-4">
                <SystemSettings />
              </TabsContent>
              
              <TabsContent value="seguranca" className="space-y-4">
                {loading ? (
                  <div className="p-4 bg-muted rounded-md">
                    <p className="text-center">Carregando informações de segurança...</p>
                  </div>
                ) : (
                  <SecuritySettings user={user} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Configuracoes;
