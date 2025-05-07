
import React from "react";
import Layout from "@/components/layout/Layout";
import CardEstatistica from "@/components/dashboard/CardEstatistica";
import GraficoCategorias from "@/components/dashboard/GraficoCategorias";
import GraficoValidade from "@/components/dashboard/GraficoValidade";
import ListaAlertas from "@/components/dashboard/ListaAlertas";
import { Package, AlertTriangle, Trash2 } from "lucide-react";
import { dadosDashboard } from "@/mockData";

const Dashboard: React.FC = () => {
  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Seção de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardEstatistica
            titulo="Total de Produtos"
            valor={dadosDashboard.totalProdutos}
            descricao="Produtos cadastrados no sistema"
            icone={<Package size={20} className="text-hoppe-600" />}
            corIcone="bg-hoppe-100"
          />
          <CardEstatistica
            titulo="Produtos a Vencer"
            valor={dadosDashboard.produtosAVencer}
            descricao="Vencem nos próximos 7 dias"
            icone={<AlertTriangle size={20} className="text-alerta-500" />}
            corIcone="bg-alerta-100"
          />
          <CardEstatistica
            titulo="Produtos Vencidos"
            valor={dadosDashboard.produtosVencidos}
            descricao="Necessitam descarte imediato"
            icone={<Trash2 size={20} className="text-erro-500" />}
            corIcone="bg-erro-100"
          />
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
