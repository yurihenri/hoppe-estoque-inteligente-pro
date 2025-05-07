
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { categorias, dadosDashboard } from "@/mockData";

const GraficoCategorias: React.FC = () => {
  // Obter cores para cada categoria
  const cores = categorias.map((categoria) => categoria.cor);

  return (
    <Card className="col-span-1 card-stats">
      <CardHeader>
        <CardTitle className="text-lg">Distribuição por Categorias</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosDashboard.distribuicaoCategorias}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
                nameKey="categoria"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dadosDashboard.distribuicaoCategorias.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={cores[index % cores.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} produtos`, name]}
                contentStyle={{ borderRadius: '0.375rem', border: '1px solid #e2e8f0' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoCategorias;
