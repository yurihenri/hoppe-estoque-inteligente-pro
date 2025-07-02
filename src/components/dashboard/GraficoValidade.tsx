
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, isAfter } from "date-fns";

const GraficoValidade: React.FC = () => {
  const { data: distribuicaoValidade, isLoading } = useQuery({
    queryKey: ['distribuicaoValidade'],
    queryFn: async () => {
      // Fetch all produtos with validade
      const { data, error } = await supabase
        .from('produtos')
        .select('validade');
        
      if (error) throw error;
      
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const vencidos = data.filter(item => 
        item.validade && isBefore(new Date(item.validade), today)
      ).length;
      
      const proximosAoVencimento = data.filter(item => 
        item.validade && 
        isAfter(new Date(item.validade), today) && 
        isBefore(new Date(item.validade), nextWeek)
      ).length;
      
      const normais = data.filter(item => 
        item.validade && isAfter(new Date(item.validade), nextWeek)
      ).length;
      
      const semData = data.filter(item => !item.validade).length;
      
      return [
        { status: "Normal", quantidade: normais, cor: "#10B981" },
        { status: "Próximo ao Vencimento", quantidade: proximosAoVencimento, cor: "#F59E0B" },
        { status: "Vencido", quantidade: vencidos, cor: "#EF4444" },
        { status: "Sem Data", quantidade: semData, cor: "#6B7280" }
      ].filter(item => item.quantidade > 0);
    }
  });

  const renderPlaceholderData = () => {
    return [
      { status: "Carregando...", quantidade: 1, cor: "#9CA3AF" }
    ];
  };

  const chartData = isLoading || !distribuicaoValidade || distribuicaoValidade.length === 0 
    ? renderPlaceholderData() 
    : distribuicaoValidade;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Status de Validade</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
                nameKey="status"
                label={({ name, percent }) => 
                  isLoading ? "" : `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.cor} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => [`${value} itens`, name]}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: '0.5rem',
                  color: '#111827'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#111827' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoValidade;
