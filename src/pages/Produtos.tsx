
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Produtos = () => {
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      // Placeholder for Produtos - will be implemented in a future update
      // This route is currently returning a 404, but we're creating the component
      // so it can be properly routed
      
      // Temporary empty data until we create the products table
      setProdutos([]);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Produtos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Carregando produtos...</p>
            ) : produtos.length > 0 ? (
              <p className="text-center py-4">Lista de produtos será implementada em breve</p>
            ) : (
              <p className="text-center py-4">Nenhum produto cadastrado.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Produtos;
