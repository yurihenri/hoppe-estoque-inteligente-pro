
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown } from 'lucide-react';

interface ExportButtonProps {
  onExport: () => void;
  exportando: boolean;
  type: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport, exportando, type }) => {
  return (
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        onClick={onExport}
        disabled={exportando}
      >
        {exportando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
        Exportar CSV
      </Button>
    </div>
  );
};

export default ExportButton;
