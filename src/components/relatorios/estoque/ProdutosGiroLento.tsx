
import React from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Produto } from '@/types';

interface ProdutoGiroLentoProps {
  produtos: Array<Produto & { 
    diasEmEstoque: number;
    classificacaoABC?: string;
  }>;
}

const ProdutosGiroLento: React.FC<ProdutoGiroLentoProps> = ({ produtos }) => {
  if (produtos.length === 0) return null;
  
  return (
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
            {produtos.map(produto => {
              const classe = produto.classificacaoABC || 'C';
              
              // Determine recommendation based on classification and time in stock
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
  );
};

export default ProdutosGiroLento;
