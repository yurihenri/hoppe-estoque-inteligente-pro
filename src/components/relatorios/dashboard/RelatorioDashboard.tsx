
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, BarChart3, Clock, DollarSign } from 'lucide-react';

interface RelatorioDashboardProps {
  isLoading: boolean;
  dadosVencimento: Array<{periodo: string, quantidade: number}>;
  produtos: any[];
  totalEmEstoque: number;
  custoVencimento: number;
}

const RelatorioDashboard: React.FC<RelatorioDashboardProps> = ({ 
  isLoading, 
  dadosVencimento, 
  produtos, 
  totalEmEstoque,
  custoVencimento 
}) => {
  return (
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
  );
};

export default RelatorioDashboard;
