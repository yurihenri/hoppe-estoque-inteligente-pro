
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VencimentosChartProps {
  dadosVencimento: Array<{
    periodo: string;
    quantidade: number;
  }>;
}

const VencimentosChart: React.FC<VencimentosChartProps> = ({ dadosVencimento }) => {
  return (
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
  );
};

export default VencimentosChart;
