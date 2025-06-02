
import React from "react";
import Layout from "@/components/layout/Layout";
import CardEstatistica from "@/components/dashboard/CardEstatistica";
import GraficoCategorias from "@/components/dashboard/GraficoCategorias";
import GraficoValidade from "@/components/dashboard/GraficoValidade";
import ListaAlertas from "@/components/dashboard/ListaAlertas";
import { ListaProdutos } from "@/components/dashboard/ListaProdutos";
import { Package, AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, isAfter } from "date-fns";
import { Button } from "@/components/ui/button";

const Dashboard: React.FC = () => {
  // Fetch dashboard statistics with better error handling
  const { data: dashboardStats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      // Fetch all products
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      // Calculate statistics
      const totalProdutos = produtos?.length || 0;
      
      const produtosVencidos = produtos?.filter(produto => 
        produto.validade && isBefore(new Date(produto.validade), today)
      ).length || 0;
      
      const produtosAVencer = produtos?.filter(produto => 
        produto.validade && 
        isAfter(new Date(produto.validade), today) && 
        isBefore(new Date(produto.validade), nextWeek)
      ).length || 0;
      
      // Calcular produtos com estoque baixo (menos de 5 unidades)
      const produtosEstoqueBaixo = produtos?.filter(produto => 
        produto.quantidade <= 5
      ).length || 0;
      
      // Calcular produtos sem categoria
      const produtosSemCategoria = produtos?.filter(produto => 
        !produto.categoria_id
      ).length || 0;
      
      const stats = {
        totalProdutos,
        produtosVencidos,
        produtosAVencer,
        produtosEstoqueBaixo,
        produtosSemCategoria
      };
      
      return stats;
    },
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });

  // Se há erro no carregamento dos dados
  if (error && !isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Erro ao Carregar Dashboard
            </h3>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados do painel. Verifique sua conexão e tente novamente.
            </p>
            <Button 
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Seção de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardEstatistica
            titulo="Total de Produtos"
            valor={isLoading ? 0 : Number(dashboardStats?.totalProdutos || 0)}
            descricao="Produtos cadastrados no sistema"
            icone={<Package size={20} className="text-hoppe-600" />}
            corIcone="bg-hoppe-100"
          />
          <CardEstatistica
            titulo="Produtos a Vencer"
            valor={isLoading ? 0 : Number(dashboardStats?.produtosAVencer || 0)}
            descricao="Vencem nos próximos 7 dias"
            icone={<AlertTriangle size={20} className="text-alerta-500" />}
            corIcone="bg-alerta-100"
          />
          <CardEstatistica
            titulo="Produtos Vencidos"
            valor={isLoading ? 0 : Number(dashboardStats?.produtosVencidos || 0)}
            descricao="Necessitam descarte imediato"
            icone={<Trash2 size={20} className="text-erro-500" />}
            corIcone="bg-erro-100"
          />
        </div>

        {/* Lista de produtos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <ListaProdutos />
        </div>

        {/* Seção de gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GraficoCategorias />
          <GraficoValidade />
        </div>

        {/* Lista de alertas */}
        <ListaAlertas />
      </div>
    </Layout>
  );
};

export default Dashboard;
