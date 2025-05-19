import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, BarChart3, Clock, DollarSign } from 'lucide-react';
import { format, addDays, isBefore } from 'date-fns';
import { pt } from 'date-fns/locale';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import RelatorioVencimentos from '@/components/relatorios/RelatorioVencimentos';
import RelatorioGiroEstoque from '@/components/relatorios/RelatorioGiroEstoque';
import RelatorioFinanceiro from '@/components/relatorios/RelatorioFinanceiro';
import { Produto, Categoria } from '@/types';
import { normalizeCategoria, normalizeProduto } from '@/utils/normalizeData';

// Tipos para os dados de relatório
interface DadosVencimento {
  periodo: string;
  quantidade: number;
}

interface DadosFinanceiros {
  categoria: string;
  valorTotal: number;
  custoVencimento: number;
}

const Relatorios = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [dadosVencimento, setDadosVencimento] = useState<DadosVencimento[]>([]);
  const [totalEmEstoque, setTotalEmEstoque] = useState(0);
  const [custoVencimento, setCustoVencimento] = useState(0);
  const [exportando, setExportando] = useState(false);

  // Carregar dados básicos necessários para os relatórios
  useEffect(() => {
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

    carregarDados();
  }, []);

  // Função para exportar relatório em CSV
  const exportarCSV = (tipo: string) => {
    setExportando(true);
    
    try {
      let dados: any[] = [];
      let nomeArquivo = '';
      
      // Preparar dados específicos para cada tipo de relatório
      if (tipo === 'vencimentos') {
        dados = produtos
          .filter(p => p.validade)
          .map(p => ({
            Nome: p.nome,
            Categoria: p.categoria?.nome || 'Sem categoria',
            'Data de Validade': p.validade ? format(new Date(p.validade), 'dd/MM/yyyy', {locale: pt}) : 'N/A',
            'Dias até Vencer': p.validade ? 
              Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 'N/A',
            'Estoque Atual': p.estoqueAtual,
            'Valor Total': (p.preco * p.estoqueAtual).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
          }));
        nomeArquivo = 'relatorio-vencimentos';
      } else if (tipo === 'estoque') {
        // Dados simplificados de giro de estoque
        dados = produtos.map(p => ({
          Nome: p.nome,
          Categoria: p.categoria?.nome || 'Sem categoria',
          'Estoque Atual': p.estoqueAtual,
          'Data de Entrada': format(new Date(p.dataEntrada), 'dd/MM/yyyy', {locale: pt}),
          'Dias em Estoque': Math.ceil((new Date().getTime() - new Date(p.dataEntrada).getTime()) / (1000 * 3600 * 24))
        }));
        nomeArquivo = 'relatorio-giro-estoque';
      } else if (tipo === 'financeiro') {
        // Dados financeiros por produto
        dados = produtos.map(p => ({
          Nome: p.nome,
          Categoria: p.categoria?.nome || 'Sem categoria',
          'Preço Unitário': p.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}),
          'Estoque': p.estoqueAtual,
          'Valor Total': (p.preco * p.estoqueAtual).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
        }));
        nomeArquivo = 'relatorio-financeiro';
      }
      
      // Converter para CSV
      if (dados.length > 0) {
        // Cabeçalhos
        const headers = Object.keys(dados[0]);
        let csvContent = headers.join(',') + '\n';
        
        // Linhas de dados
        dados.forEach(item => {
          const row = headers.map(header => {
            const value = item[header];
            // Garantir que strings com vírgulas sejam envolvidas em aspas
            return typeof value === 'string' && value.includes(',') 
              ? `"${value}"` 
              : value;
          }).join(',');
          csvContent += row + '\n';
        });
        
        // Criar e baixar o arquivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${nomeArquivo}-${format(new Date(), 'dd-MM-yyyy')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`Relatório de ${tipo} exportado com sucesso`);
      } else {
        toast.warning('Não há dados disponíveis para exportar');
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast.error('Erro ao exportar relatório');
    } finally {
      setExportando(false);
    }
  };

  return (
    <Layout title="Relatórios">
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
        
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Resumo dos principais indicadores</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Vencimentos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    dadosVencimento.reduce((acc, item) => acc + item.quantidade, 0)}
                </div>
                <p className="text-sm text-muted-foreground">produtos vencem em 30 dias</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Giro de Estoque</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    produtos.length > 0 ? 
                      `${Math.round(30 / (produtos.length / produtos.filter(p => p.estoqueAtual > 0).length))} dias` : 
                      'N/A'}
                </div>
                <p className="text-sm text-muted-foreground">tempo médio de permanência</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-lg">Valor em Estoque</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                    totalEmEstoque.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      maximumFractionDigits: 0
                    })}
                </div>
                <p className="text-sm text-muted-foreground">
                  {custoVencimento > 0 ? 
                    `${custoVencimento.toLocaleString('pt-BR', {
                      style: 'currency', 
                      currency: 'BRL',
                      maximumFractionDigits: 0
                    })} em risco` : 
                    'sem produtos em risco'}
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
        
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
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Análise de Vencimentos</CardTitle>
                        <CardDescription>Produtos que vencem nos próximos dias</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={dadosVencimento}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="periodo" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="quantidade" name="Produtos a Vencer" fill="#f97316" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Componente detalhado de vencimentos */}
                    <RelatorioVencimentos produtos={produtos} />
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => exportarCSV('vencimentos')}
                        disabled={exportando}
                      >
                        {exportando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Exportar CSV
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Relatório de Giro de Estoque */}
              <TabsContent value="giro-estoque" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Componente detalhado de giro de estoque */}
                    <RelatorioGiroEstoque produtos={produtos} />
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => exportarCSV('estoque')}
                        disabled={exportando}
                      >
                        {exportando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Exportar CSV
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
              
              {/* Relatório Financeiro */}
              <TabsContent value="financeiro" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Componente detalhado financeiro */}
                    <RelatorioFinanceiro produtos={produtos} categorias={categorias} />
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => exportarCSV('financeiro')}
                        disabled={exportando}
                      >
                        {exportando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
                        Exportar CSV
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Relatorios;
