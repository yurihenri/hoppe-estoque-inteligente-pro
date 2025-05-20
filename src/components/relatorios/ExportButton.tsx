
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, FileDown, FileUp } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface ExportButtonProps {
  onExport: () => void;
  onImport?: () => void;
  exportando: boolean;
  type: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExport, 
  onImport, 
  exportando, 
  type 
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onImport && (
        <Button 
          variant="outline" 
          onClick={onImport}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Importar Dados
        </Button>
      )}
      
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
