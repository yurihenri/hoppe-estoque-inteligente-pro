
import React, { useMemo } from 'react';
import { Produto } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RelatorioGiroEstoqueProps {
  produtos: Produto[];
}

// Função para calcular classificação ABC (simplificada sem dados reais de vendas)
// Na prática, usaríamos dados reais de vendas, mas para demo usamos o estoque atual * preço
const calcularClassificacaoABC = (produtos: Produto[]) => {
  // Ordenar produtos por valor (estoque * preço) em ordem decrescente
  const produtosOrdenados = [...produtos]
    .filter(p => p.estoqueAtual > 0 && p.preco > 0)
    .sort((a, b) => (b.preco * b.estoqueAtual) - (a.preco * a.estoqueAtual));
  
  const totalValor = produtosOrdenados.reduce((acc, p) => acc + (p.preco * p.estoqueAtual), 0);
  let valorAcumulado = 0;
  
  return produtosOrdenados.map(produto => {
    const valorProduto = produto.preco * produto.estoqueAtual;
    valorAcumulado += valorProduto;
    const percentualAcumulado = (valorAcumulado / totalValor) * 100;
    
    // Classificação ABC baseada no percentual acumulado
    let classificacao = '';
    if (percentualAcumulado <= 70) {
      classificacao = 'A';
    } else if (percentualAcumulado <= 90) {
      classificacao = 'B';
    } else {
      classificacao = 'C';
    }
    
    return {
      ...produto,
      classificacaoABC: classificacao,
      valorEstoque: valorProduto,
      percentualAcumulado
    };
  });
};

const RelatorioGiroEstoque: React.FC<RelatorioGiroEstoqueProps> = ({ produtos }) => {
  // Calcular tempo médio em estoque
  const produtosComTempoEstoque = produtos.map(produto => {
    const diasEmEstoque = differenceInDays(new Date(), new Date(produto.dataEntrada));
    return {
      ...produto,
      diasEmEstoque
    };
  });
  
  // Calcular produtos com giro lento (mais de 60 dias em estoque)
  const produtosGiroLento = produtosComTempoEstoque
    .filter(p => p.diasEmEstoque > 60 && p.estoqueAtual > 0)
    .sort((a, b) => b.diasEmEstoque - a.diasEmEstoque);
  
  // Classificação ABC
  const produtosClassificados = useMemo(() => calcularClassificacaoABC(produtos), [produtos]);
  
  // Dados para o gráfico de classificação
  const dadosClassificacao = [
    {
      nome: 'Classe A',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'A').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'A')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    },
    {
      nome: 'Classe B',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'B').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'B')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    },
    {
      nome: 'Classe C',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'C').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'C')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    }
  ];

  return (
    <>
      {/* Análise de classificação ABC */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Classificação ABC</CardTitle>
          <CardDescription>
            A: 70% do valor (itens mais importantes), B: 20% do valor, C: 10% do valor (itens menos importantes)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosClassificacao}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="quantidade" name="Quantidade de Itens" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="valor" name="Valor Total (R$)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-md bg-blue-100">
              <h3 className="font-bold text-lg text-blue-800">Classe A</h3>
              <p className="text-sm text-muted-foreground">Alta prioridade</p>
              <p className="mt-2 text-blue-900">
                Manter estoque adequado<br />
                Monitoramento constante
              </p>
            </div>
            
            <div className="p-4 rounded-md bg-green-100">
              <h3 className="font-bold text-lg text-green-800">Classe B</h3>
              <p className="text-sm text-muted-foreground">Média prioridade</p>
              <p className="mt-2 text-green-900">
                Estoque moderado<br />
                Verificação periódica
              </p>
            </div>
            
            <div className="p-4 rounded-md bg-amber-100">
              <h3 className="font-bold text-lg text-amber-800">Classe C</h3>
              <p className="text-sm text-muted-foreground">Baixa prioridade</p>
              <p className="mt-2 text-amber-900">
                Estoque mínimo<br />
                Otimizar custos de armazenagem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Produtos com giro lento */}
      {produtosGiroLento.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Produtos com Giro Lento</CardTitle>
            <CardDescription>
              Produtos que estão há mais de 60 dias em estoque sem movimentação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Data de Entrada</TableHead>
                  <TableHead>Dias em Estoque</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Recomendação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosGiroLento.map(produto => {
                  const produtoClassificado = produtosClassificados.find(p => p.id === produto.id);
                  const classe = produtoClassificado?.classificacaoABC || 'C';
                  
                  // Determinar recomendação com base na classificação e tempo em estoque
                  let recomendacao = '';
                  if (classe === 'A') {
                    recomendacao = 'Revisar posicionamento';
                  } else if (classe === 'B') {
                    recomendacao = 'Aplicar desconto';
                  } else {
                    recomendacao = 'Considerar descontinuar';
                  }
                  
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria?.nome || 'Sem categoria'}</TableCell>
                      <TableCell className="text-right">{produto.estoqueAtual}</TableCell>
                      <TableCell>
                        {format(new Date(produto.dataEntrada), 'dd/MM/yyyy', {locale: pt})}
                      </TableCell>
                      <TableCell>{produto.diasEmEstoque} dias</TableCell>
                      <TableCell>
                        <Badge className={
                          classe === 'A' ? 'bg-blue-100 text-blue-800' :
                          classe === 'B' ? 'bg-green-100 text-green-800' :
                                         'bg-amber-100 text-amber-800'
                        }>
                          Classe {classe}
                        </Badge>
                      </TableCell>
                      <TableCell>{recomendacao}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Classificação detalhada dos produtos */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Classificação ABC de Produtos</CardTitle>
          <CardDescription>
            Produtos classificados por valor para o negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-right">Estoque</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
                <TableHead>Classe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosClassificados.slice(0, 15).map(produto => (
                <TableRow key={produto.id}>
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>{produto.categoria?.nome || 'Sem categoria'}</TableCell>
                  <TableCell className="text-right">
                    {produto.preco.toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell className="text-right">{produto.estoqueAtual}</TableCell>
                  <TableCell className="text-right">
                    {(produto.preco * produto.estoqueAtual).toLocaleString('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      produto.classificacaoABC === 'A' ? 'bg-blue-100 text-blue-800' :
                      produto.classificacaoABC === 'B' ? 'bg-green-100 text-green-800' :
                                                      'bg-amber-100 text-amber-800'
                    }>
                      Classe {produto.classificacaoABC}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {produtosClassificados.length > 15 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando 15 de {produtosClassificados.length} produtos
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RelatorioGiroEstoque;
