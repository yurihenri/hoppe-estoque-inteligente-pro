
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
        { status: "Sem Data", quantidade: semData, cor: "#64748B" }
      ].filter(item => item.quantidade > 0);
    }
  });

  const renderPlaceholderData = () => {
    return [
      { status: "Carregando...", quantidade: 1, cor: "#64748B" }
    ];
  };

  const chartData = isLoading || !distribuicaoValidade || distribuicaoValidade.length === 0 
    ? renderPlaceholderData() 
    : distribuicaoValidade;

  return (
    <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
      <CardHeader>
        <CardTitle className="text-lg text-white">Status de Validade</CardTitle>
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
                  backgroundColor: '#1E293B', 
                  border: '1px solid #334155', 
                  borderRadius: '0.5rem',
                  color: '#F8FAFC'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#F8FAFC' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraficoValidade;
