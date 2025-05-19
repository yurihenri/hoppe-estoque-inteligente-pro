
import React, { useMemo } from 'react';
import { Produto, Categoria } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { differenceInDays } from 'date-fns';

interface RelatorioFinanceiroProps {
  produtos: Produto[];
  categorias: Categoria[];
}

const RelatorioFinanceiro: React.FC<RelatorioFinanceiroProps> = ({ produtos, categorias }) => {
  // Calcular valores financeiros por categoria
  const dadosFinanceirosPorCategoria = useMemo(() => {
    const dadosPorCategoria: Record<string, {
      id: string,
      nome: string,
      cor: string,
      valorTotal: number,
      custoVencimento: number,
      quantidadeProdutos: number
    }> = {};
    
    // Inicializar com todas as categorias
    categorias.forEach(categoria => {
      dadosPorCategoria[categoria.id] = {
        id: categoria.id,
        nome: categoria.nome,
        cor: categoria.cor || '#3B82F6',
        valorTotal: 0,
        custoVencimento: 0,
        quantidadeProdutos: 0
      };
    });
    
    // Adicionar categoria "Sem categoria" para produtos sem categoria
    dadosPorCategoria['sem-categoria'] = {
      id: 'sem-categoria',
      nome: 'Sem categoria',
      cor: '#94a3b8',
      valorTotal: 0,
      custoVencimento: 0,
      quantidadeProdutos: 0
    };
    
    // Calcular valores para cada produto
    produtos.forEach(produto => {
      const categoriaId = produto.categoriaId || 'sem-categoria';
      const valorEstoque = produto.preco * produto.estoqueAtual;
      
      // Verificar se a categoria existe (caso tenha sido removida)
      if (!dadosPorCategoria[categoriaId]) {
        dadosPorCategoria[categoriaId] = {
          id: categoriaId,
          nome: 'Categoria Desconhecida',
          cor: '#94a3b8',
          valorTotal: 0,
          custoVencimento: 0,
          quantidadeProdutos: 0
        };
      }
      
      // Adicionar valor do produto
      dadosPorCategoria[categoriaId].valorTotal += valorEstoque;
      dadosPorCategoria[categoriaId].quantidadeProdutos++;
      
      // Calcular custo de vencimento para produtos próximos da validade
      if (produto.validade) {
        const diasAteVencimento = differenceInDays(new Date(produto.validade), new Date());
        if (diasAteVencimento < 30) {
          // Quanto mais próximo do vencimento, maior a chance de perda
          const riscoPerdaPct = 
            diasAteVencimento < 0 ? 1 : // Vencido: 100% de perda
            diasAteVencimento < 7 ? 0.8 : // 7 dias: 80% de perda
            diasAteVencimento < 15 ? 0.5 : // 15 dias: 50% de perda
            0.3; // 30 dias: 30% de perda
          
          dadosPorCategoria[categoriaId].custoVencimento += valorEstoque * riscoPerdaPct;
        }
      }
    });
    
    // Converter para array e ordenar por valor total
    return Object.values(dadosPorCategoria)
      .filter(cat => cat.quantidadeProdutos > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }, [produtos, categorias]);
  
  // Calcular valor total de todo o estoque
  const valorTotalEstoque = useMemo(() => {
    return produtos.reduce((acc, produto) => acc + (produto.preco * produto.estoqueAtual), 0);
  }, [produtos]);
  
  // Calcular custo total de vencimento
  const custoTotalVencimento = useMemo(() => {
    return dadosFinanceirosPorCategoria.reduce((acc, cat) => acc + cat.custoVencimento, 0);
  }, [dadosFinanceirosPorCategoria]);

  return (
    <>
      {/* Resumo financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
          <CardDescription>
            Valor total em estoque: {valorTotalEstoque.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosFinanceirosPorCategoria}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => 
                    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  }
                />
                <Legend />
                <Bar dataKey="valorTotal" name="Valor Total em Estoque" fill="#3b82f6" />
                <Bar dataKey="custoVencimento" name="Custo de Vencimento Estimado" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Indicadores financeiros */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Valor em Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {valorTotalEstoque.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  })}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Custo de Vencimento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-destructive">
                  {custoTotalVencimento.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {((custoTotalVencimento / valorTotalEstoque) * 100).toFixed(1)}% do valor total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Valor Líquido Estimado</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {(valorTotalEstoque - custoTotalVencimento).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0
                  })}
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Detalhamento por categoria */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Valor em Estoque por Categoria</CardTitle>
          <CardDescription>
            Detalhamento financeiro dividido por categorias de produtos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead className="text-right">Valor em Estoque</TableHead>
                <TableHead className="text-right">Custo de Vencimento</TableHead>
                <TableHead className="text-right">Valor Líquido</TableHead>
                <TableHead className="text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosFinanceirosPorCategoria.map(categoria => (
                <TableRow key={categoria.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: categoria.cor }}
                      ></span>
                      {categoria.nome}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{categoria.quantidadeProdutos}</TableCell>
                  <TableCell className="text-right">
                    {categoria.valorTotal.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {categoria.custoVencimento > 0 ? (
                      <span className="text-destructive">
                        {categoria.custoVencimento.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </span>
                    ) : (
                      'R$ 0,00'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {(categoria.valorTotal - categoria.custoVencimento).toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    {((categoria.valorTotal / valorTotalEstoque) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default RelatorioFinanceiro;
