
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Produto, Categoria } from '@/types';
import RelatorioGiroEstoque from '@/components/relatorios/RelatorioGiroEstoque';
import ExportButton from '@/components/relatorios/ExportButton';
import ImportDialog from '@/components/relatorios/ImportDialog';
import { exportarCSVEstoque } from '@/utils/exportUtils';

interface EstoqueTabContentProps {
  isLoading: boolean;
  produtos: Produto[];
  categorias: Categoria[];
  empresaId: string;
  exportando: boolean;
  setExportando: (value: boolean) => void;
  onRefreshData: () => void;
}

const EstoqueTabContent: React.FC<EstoqueTabContentProps> = ({
  isLoading,
  produtos,
  categorias,
  empresaId,
  exportando,
  setExportando,
  onRefreshData
}) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  const handleExport = () => {
    setExportando(true);
    exportarCSVEstoque(produtos);
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
      <RelatorioGiroEstoque produtos={produtos} />
      
      <ExportButton 
        onExport={handleExport}
        onImport={handleImport}
        exportando={exportando}
        type="estoque"
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

export default EstoqueTabContent;
