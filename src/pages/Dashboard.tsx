
import React, { Suspense } from "react";
import Layout from "@/components/layout/Layout";
import CardEstatistica from "@/components/dashboard/CardEstatistica";
import GraficoCategorias from "@/components/dashboard/GraficoCategorias";
import GraficoValidade from "@/components/dashboard/GraficoValidade";
import ListaAlertas from "@/components/dashboard/ListaAlertas";
import { ListaProdutos } from "@/components/dashboard/ListaProdutos";
import { Package, AlertTriangle, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DashboardSkeleton } from "@/components/ui/skeleton-dashboard";

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, error, refetch } = useDashboardData();

  // Se há erro no carregamento dos dados
  if (error && !isLoading) {
    return (
      <Layout title="Dashboard">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Erro ao Carregar Dashboard
            </h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar os dados do painel. Verifique sua conexão e tente novamente.
            </p>
            <Button 
              onClick={() => refetch()}
              variant="default"
            >
              <RefreshCw size={16} className="mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="Dashboard">
        <DashboardSkeleton />
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
            valor={dashboardData?.stats.totalProdutos || 0}
            descricao="Produtos cadastrados no sistema"
            icone={<Package size={20} className="text-primary" />}
            corIcone="bg-primary/10"
          />
          <CardEstatistica
            titulo="Produtos a Vencer"
            valor={dashboardData?.stats.produtosAVencer || 0}
            descricao="Vencem nos próximos 7 dias"
            icone={<AlertTriangle size={20} className="text-warning" />}
            corIcone="bg-warning/10"
          />
          <CardEstatistica
            titulo="Produtos Vencidos"
            valor={dashboardData?.stats.produtosVencidos || 0}
            descricao="Necessitam descarte imediato"
            icone={<Trash2 size={20} className="text-destructive" />}
            corIcone="bg-destructive/10"
          />
        </div>

        {/* Lista de produtos */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Produtos</h2>
          <Suspense fallback={<DashboardSkeleton />}>
            <ListaProdutos />
          </Suspense>
        </div>

        {/* Seção de gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <GraficoCategorias />
            <GraficoValidade />
          </Suspense>
        </div>

        {/* Lista de alertas */}
        <Suspense fallback={<DashboardSkeleton />}>
          <ListaAlertas />
        </Suspense>
      </div>
    </Layout>
  );
};

export default Dashboard;
