
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Produto } from '@/types';

interface ClassificacaoABCTabelaProps {
  produtos: Array<Produto & { 
    classificacaoABC: string;
    valorEstoque: number;
  }>;
}

const ClassificacaoABCTabela: React.FC<ClassificacaoABCTabelaProps> = ({ produtos }) => {
  return (
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
            {produtos.slice(0, 15).map(produto => (
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
        
        {produtos.length > 15 && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Mostrando 15 de {produtos.length} produtos
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassificacaoABCTabela;
