
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ClassificacaoABCGraficoProps {
  dadosClassificacao: Array<{
    nome: string;
    quantidade: number;
    valor: number;
  }>;
}

const ClassificacaoABCGrafico: React.FC<ClassificacaoABCGraficoProps> = ({ dadosClassificacao }) => {
  return (
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
  );
};

export default ClassificacaoABCGrafico;
