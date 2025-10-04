
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GraficoCategorias: React.FC = () => {
  const { data: distribuicaoCategorias, isLoading } = useQuery({
    queryKey: ['distribuicaoCategorias'],
    queryFn: async () => {
      // Optimized query with aggregation
      const { data: categoriasData, error: catError } = await supabase
        .from('categorias')
        .select(`
          id,
          nome,
          cor,
          produtos:produtos(count)
        `);
      
      if (catError) throw catError;
      
      const results = categoriasData
        ?.map(cat => ({
          categoria: cat.nome,
          quantidade: (cat.produtos as any)?.[0]?.count || 0,
          cor: cat.cor || '#3B82F6'
        }))
        .filter(item => item.quantidade > 0) || [];
      
      return results;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const renderPlaceholderData = () => {
    return [
      { categoria: "Carregando...", quantidade: 1, cor: "#CBD5E1" }
    ];
  };

  const chartData = isLoading || !distribuicaoCategorias || distribuicaoCategorias.length === 0 
    ? renderPlaceholderData() 
    : distribuicaoCategorias;

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Distribuição por Categorias</CardTitle>
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
                nameKey="categoria"
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
