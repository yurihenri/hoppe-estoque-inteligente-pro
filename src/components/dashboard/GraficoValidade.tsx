
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { dadosDashboard } from "@/mockData";

const GraficoValidade: React.FC = () => {
  // Cores para os status
  const cores = {
    "Normal": "#10B981", // Verde para normal
    "Próximo ao Vencimento": "#F59E0B", // Amarelo para próximo ao vencimento
    "Vencido": "#EF4444" // Vermelho para vencido
  };

  return (
    <Card className="col-span-1 card-stats">
      <CardHeader>
        <CardTitle className="text-lg">Status de Validade</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosDashboard.distribuicaoValidade}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
                nameKey="status"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {dadosDashboard.distribuicaoValidade.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.status === "Normal" 
                      ? cores["Normal"] 
                      : entry.status === "Próximo ao Vencimento" 
                        ? cores["Próximo ao Vencimento"] 
                        : cores["Vencido"]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} itens`, name]}
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

export default GraficoValidade;
