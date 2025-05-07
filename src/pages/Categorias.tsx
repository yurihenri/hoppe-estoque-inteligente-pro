
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mapDbToCategoria } from '@/types/categorias';

const Categorias = () => {
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categorias')
        .select('*');

      if (error) {
        throw error;
      }

      setCategorias(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast('Não foi possível carregar as categorias.', {
        description: 'Tente novamente mais tarde.',
      });
      setLoading(false);
    }
  };

  return (
    <Layout title="Categorias">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Categorias</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Lista de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4">Carregando categorias...</p>
            ) : categorias.length > 0 ? (
              <p className="text-center py-4">Lista de categorias será implementada em breve</p>
            ) : (
              <p className="text-center py-4">Nenhuma categoria cadastrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Categorias;
