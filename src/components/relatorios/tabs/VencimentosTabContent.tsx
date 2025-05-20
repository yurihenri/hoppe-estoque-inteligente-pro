
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Produto, Categoria } from '@/types';
import RelatorioVencimentos from '@/components/relatorios/RelatorioVencimentos';
import VencimentosChart from '@/components/relatorios/vencimentos/VencimentosChart';
import ExportButton from '@/components/relatorios/ExportButton';
import ImportDialog from '@/components/relatorios/ImportDialog';
import { exportarCSVVencimentos } from '@/utils/exportUtils';

interface DadosVencimento {
  periodo: string;
  quantidade: number;
}

interface VencimentosTabContentProps {
  isLoading: boolean;
  produtos: Produto[];
  categorias: Categoria[];
  empresaId: string;
  dadosVencimento: DadosVencimento[];
  exportando: boolean;
  setExportando: (value: boolean) => void;
  onRefreshData: () => void;
}

const VencimentosTabContent: React.FC<VencimentosTabContentProps> = ({
  isLoading,
  produtos,
  categorias,
  empresaId,
  dadosVencimento,
  exportando,
  setExportando,
  onRefreshData
}) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleExport = () => {
    setExportando(true);
    exportarCSVVencimentos(produtos);
    setExportando(false);
  };

  const handleImport = () => {
    setImportDialogOpen(true);
  };

  const handleImportSuccess = () => {
    onRefreshData();
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
        onImport={handleImport}
        exportando={exportando}
        type="vencimentos"
      />

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        categorias={categorias}
        empresaId={empresaId}
        onSuccess={handleImportSuccess}
      />
    </>
  );
};

export default VencimentosTabContent;
