
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Produto } from '@/types';
import RelatorioGiroEstoque from '@/components/relatorios/RelatorioGiroEstoque';
import ExportButton from '@/components/relatorios/ExportButton';
import { exportarCSVEstoque } from '@/utils/exportUtils';

interface EstoqueTabContentProps {
  isLoading: boolean;
  produtos: Produto[];
  exportando: boolean;
  setExportando: (value: boolean) => void;
}

const EstoqueTabContent: React.FC<EstoqueTabContentProps> = ({
  isLoading,
  produtos,
  exportando,
  setExportando
}) => {
  const handleExport = () => {
    setExportando(true);
    exportarCSVEstoque(produtos);
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
      <RelatorioGiroEstoque produtos={produtos} />
      
      <ExportButton 
        onExport={handleExport}
        exportando={exportando}
        type="estoque"
      />
    </>
  );
};

export default EstoqueTabContent;
