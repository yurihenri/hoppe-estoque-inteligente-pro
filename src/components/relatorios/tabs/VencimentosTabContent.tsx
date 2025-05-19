
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Produto } from '@/types';
import RelatorioVencimentos from '@/components/relatorios/RelatorioVencimentos';
import VencimentosChart from '@/components/relatorios/vencimentos/VencimentosChart';
import ExportButton from '@/components/relatorios/ExportButton';
import { exportarCSVVencimentos } from '@/utils/exportUtils';

interface VencimentosTabContentProps {
  isLoading: boolean;
  produtos: Produto[];
  dadosVencimento: Array<{periodo: string, quantidade: number}>;
  exportando: boolean;
  setExportando: (value: boolean) => void;
}

const VencimentosTabContent: React.FC<VencimentosTabContentProps> = ({
  isLoading,
  produtos,
  dadosVencimento,
  exportando,
  setExportando
}) => {
  const handleExport = () => {
    setExportando(true);
    exportarCSVVencimentos(produtos);
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
      <VencimentosChart dadosVencimento={dadosVencimento} />
      
      <RelatorioVencimentos produtos={produtos} />
      
      <ExportButton 
        onExport={handleExport}
        exportando={exportando}
        type="vencimentos"
      />
    </>
  );
};

export default VencimentosTabContent;
