
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { Produto, Categoria } from '@/types';
import { normalizeCategoria, normalizeProduto } from '@/utils/normalizeData';
import RelatorioDashboard from '@/components/relatorios/dashboard/RelatorioDashboard';
import VencimentosTabContent from '@/components/relatorios/tabs/VencimentosTabContent';
import EstoqueTabContent from '@/components/relatorios/tabs/EstoqueTabContent';
import FinanceiroTabContent from '@/components/relatorios/tabs/FinanceiroTabContent';
import { addDays, isBefore, format } from 'date-fns';

// Tipos para os dados de relatório
interface DadosVencimento {
  periodo: string;
  quantidade: number;
}

const Relatorios = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [dadosVencimento, setDadosVencimento] = useState<DadosVencimento[]>([]);
  const [totalEmEstoque, setTotalEmEstoque] = useState(0);
  const [custoVencimento, setCustoVencimento] = useState(0);
  const [exportando, setExportando] = useState(false);
  const [empresaId, setEmpresaId] = useState<string>('');

  // Carregar dados básicos necessários para os relatórios
  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar produtos
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nome,
            cor
          )
        `);

      if (produtosError) throw produtosError;

      // Carregar categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*');
        
      if (categoriasError) throw categoriasError;

      // Processar produtos e gerar dados para gráficos
      const produtosNormalizados = produtosData.map(normalizeProduto);
      const categoriasNormalizadas = categoriasData.map(normalizeCategoria);

      // Salvar o ID da empresa para importação
      if (produtosNormalizados.length > 0) {
        setEmpresaId(produtosNormalizados[0].empresaId);
      } else if (categoriasNormalizadas.length > 0) {
        setEmpresaId(categoriasNormalizadas[0].empresaId);
      }

      // Calcular vencimentos para diferentes períodos
      const hoje = new Date();
      const em7Dias = addDays(hoje, 7);
      const em15Dias = addDays(hoje, 15);
      const em30Dias = addDays(hoje, 30);

      const vencemEm7Dias = produtosNormalizados.filter(p => 
        p.validade && isBefore(new Date(p.validade), em7Dias) && !isBefore(new Date(p.validade), hoje)
      ).length;
      
      const vencemEm15Dias = produtosNormalizados.filter(p => 
        p.validade && isBefore(new Date(p.validade), em15Dias) && !isBefore(new Date(p.validade), em7Dias)
      ).length;
      
      const vencemEm30Dias = produtosNormalizados.filter(p => 
        p.validade && isBefore(new Date(p.validade), em30Dias) && !isBefore(new Date(p.validade), em15Dias)
      ).length;

      // Calcular valor total em estoque e custo de vencimento
      const valorEstoque = produtosNormalizados.reduce((total, produto) => 
        total + (produto.preco * produto.estoqueAtual), 0
      );

      const valorPotencialPerdido = produtosNormalizados
        .filter(p => p.validade && isBefore(new Date(p.validade), em30Dias))
        .reduce((total, produto) => total + (produto.preco * produto.estoqueAtual), 0);

      // Atualizar estados
      setProdutos(produtosNormalizados);
      setCategorias(categoriasNormalizadas);
      setDadosVencimento([
        { periodo: '7 dias', quantidade: vencemEm7Dias },
        { periodo: '15 dias', quantidade: vencemEm15Dias },
        { periodo: '30 dias', quantidade: vencemEm30Dias }
      ]);
      setTotalEmEstoque(valorEstoque);
      setCustoVencimento(valorPotencialPerdido);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Não foi possível carregar os dados dos relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  return (
    <Layout title="Relatórios">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
        
        <RelatorioDashboard 
          isLoading={isLoading}
          dadosVencimento={dadosVencimento}
          produtos={produtos}
          totalEmEstoque={totalEmEstoque}
          custoVencimento={custoVencimento}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Relatórios do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="vencimentos">
              <TabsList className="mb-4">
                <TabsTrigger value="vencimentos">Vencimentos</TabsTrigger>
                <TabsTrigger value="giro-estoque">Giro de Estoque</TabsTrigger>
                <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
              </TabsList>
              
              {/* Relatório de Vencimentos */}
              <TabsContent value="vencimentos" className="space-y-4">
                <VencimentosTabContent 
                  isLoading={isLoading}
                  produtos={produtos}
                  categorias={categorias}
                  empresaId={empresaId}
                  dadosVencimento={dadosVencimento}
                  exportando={exportando}
                  setExportando={setExportando}
                  onRefreshData={carregarDados}
                />
              </TabsContent>
              
              {/* Relatório de Giro de Estoque */}
              <TabsContent value="giro-estoque" className="space-y-4">
                <EstoqueTabContent 
                  isLoading={isLoading}
                  produtos={produtos}
                  categorias={categorias}
                  empresaId={empresaId}
                  exportando={exportando}
                  setExportando={setExportando}
                  onRefreshData={carregarDados}
                />
              </TabsContent>
              
              {/* Relatório Financeiro */}
              <TabsContent value="financeiro" className="space-y-4">
                <FinanceiroTabContent 
                  isLoading={isLoading}
                  produtos={produtos}
                  categorias={categorias}
                  empresaId={empresaId}
                  exportando={exportando}
                  setExportando={setExportando}
                  onRefreshData={carregarDados}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
