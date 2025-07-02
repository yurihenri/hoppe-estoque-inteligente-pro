
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const GraficoCategorias: React.FC = () => {
  const { data: distribuicaoCategorias, isLoading } = useQuery({
    queryKey: ['distribuicaoCategorias'],
    queryFn: async () => {
      // Fetch categorias count
      const { data: categoriasData, error } = await supabase
        .from('categorias')
        .select('id, nome, cor');
      
      if (error) throw error;

      // Get count of produtos per categoria
      const produtosPromises = categoriasData.map(async (categoria) => {
        const { count, error: countError } = await supabase
          .from('produtos')
          .select('id', { count: 'exact', head: true })
          .eq('categoria_id', categoria.id);
          
        if (countError) throw countError;
        
        return {
          categoria: categoria.nome,
          quantidade: count || 0,
          cor: categoria.cor || '#6B7280'
        };
      });
      
      const results = await Promise.all(produtosPromises);
      return results.filter(item => item.quantidade > 0);
    }
  });

  const renderPlaceholderData = () => {
    return [
      { categoria: "Carregando...", quantidade: 1, cor: "#9CA3AF" }
    ];
  };

  const chartData = isLoading || !distribuicaoCategorias || distribuicaoCategorias.length === 0 
    ? renderPlaceholderData() 
    : distribuicaoCategorias;

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">Distribuição por Categorias</CardTitle>
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

export default GraficoCategorias;
