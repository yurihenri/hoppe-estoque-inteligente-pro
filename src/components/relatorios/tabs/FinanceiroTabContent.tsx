
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Produto, Categoria } from '@/types';
import RelatorioFinanceiro from '@/components/relatorios/RelatorioFinanceiro';
import ExportButton from '@/components/relatorios/ExportButton';
import { exportarCSVFinanceiro } from '@/utils/exportUtils';

interface FinanceiroTabContentProps {
  isLoading: boolean;
  produtos: Produto[];
  categorias: Categoria[];
  exportando: boolean;
  setExportando: (value: boolean) => void;
}

const FinanceiroTabContent: React.FC<FinanceiroTabContentProps> = ({
  isLoading,
  produtos,
  categorias,
  exportando,
  setExportando
}) => {
  const handleExport = () => {
    setExportando(true);
    exportarCSVFinanceiro(produtos);
    setExportando(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <>
      <RelatorioFinanceiro produtos={produtos} categorias={categorias} />
      
      <ExportButton 
        onExport={handleExport}
        exportando={exportando}
        type="financeiro"
      />
    </>
  );
};

export default FinanceiroTabContent;
