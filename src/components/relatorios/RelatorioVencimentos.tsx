
import React from 'react';
import { Produto } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RelatorioVencimentosProps {
  produtos: Produto[];
}

const RelatorioVencimentos: React.FC<RelatorioVencimentosProps> = ({ produtos }) => {
  // Filtrar produtos com data de validade e ordenar por proximidade de vencimento
  const produtosComValidade = produtos
    .filter(p => p.validade)
    .sort((a, b) => {
      if (!a.validade || !b.validade) return 0;
      return new Date(a.validade).getTime() - new Date(b.validade).getTime();
    });

  // Identificar produtos de alto risco (próximos ao vencimento e com alto estoque)
  const produtosAltoRisco = produtosComValidade.filter(produto => {
    if (!produto.validade) return false;
    
    const diasAteVencimento = differenceInDays(new Date(produto.validade), new Date());
    // Critérios: próximo ao vencimento (menos de 15 dias) e estoque alto (mais de 10 unidades)
    return diasAteVencimento < 15 && produto.estoqueAtual > 10;
  });

  // Função para determinar o status do produto com base na validade
  const getStatusValidade = (dataValidade: string) => {
    const diasAteVencimento = differenceInDays(new Date(dataValidade), new Date());
    
    if (diasAteVencimento < 0) {
      return { label: 'Vencido', className: 'bg-destructive text-destructive-foreground' };
    } else if (diasAteVencimento < 7) {
      return { label: 'Crítico', className: 'bg-destructive text-destructive-foreground' };
    } else if (diasAteVencimento < 15) {
      return { label: 'Atenção', className: 'bg-warning text-warning-foreground' };
    } else if (diasAteVencimento < 30) {
      return { label: 'Próximo', className: 'bg-yellow-300 text-yellow-800' };
    } else {
      return { label: 'Ok', className: 'bg-green-100 text-green-800' };
    }
  };

  return (
    <>
      {/* Produtos de Alto Risco */}
      {produtosAltoRisco.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Produtos de Alto Risco</CardTitle>
            </div>
            <CardDescription>
              Produtos com grande volume e próximos ao vencimento - Recomenda-se ação imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Estoque</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead>Ação Recomendada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosAltoRisco.map(produto => {
                  const diasAteVencimento = produto.validade 
                    ? differenceInDays(new Date(produto.validade), new Date())
                    : 0;
                    
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria?.nome || 'Sem categoria'}</TableCell>
                      <TableCell className="text-right">{produto.estoqueAtual}</TableCell>
                      <TableCell>
                        {produto.validade && format(new Date(produto.validade), 'dd/MM/yyyy', {locale: pt})}
                      </TableCell>
                      <TableCell>{diasAteVencimento} dias</TableCell>
                      <TableCell>
                        {diasAteVencimento < 7 ? (
                          <Badge className="bg-destructive text-destructive-foreground">
                            Promoção urgente
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Aplicar desconto gradual
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      
      {/* Lista de produtos com vencimento */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos com Vencimento</CardTitle>
          <CardDescription>
            {produtosComValidade.length} produtos com data de validade cadastrada
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
                <TableHead>Data de Validade</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtosComValidade.length > 0 ? (
                produtosComValidade.slice(0, 20).map(produto => {
                  const status = produto.validade 
                    ? getStatusValidade(produto.validade)
                    : { label: 'N/A', className: '' };
                    
                  return (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {produto.categoria && (
                            <span 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: produto.categoria.cor || '#3B82F6' }}
                            ></span>
                          )}
                          {produto.categoria?.nome || 'Sem categoria'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {produto.preco.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </TableCell>
                      <TableCell className="text-right">{produto.estoqueAtual}</TableCell>
                      <TableCell>
                        {produto.validade && (
                          format(new Date(produto.validade), 'dd/MM/yyyy', {locale: pt})
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Nenhum produto com data de validade cadastrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {produtosComValidade.length > 20 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando 20 de {produtosComValidade.length} produtos
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default RelatorioVencimentos;
