
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { FileUp, Upload } from 'lucide-react';

type FileType = File | null;
type MappingField = 'nome' | 'codigoBarras' | 'quantidade' | 'validade' | 'categoria';

interface ColumnMapping {
  field: MappingField;
  columnName: string;
}

const UploadManual = () => {
  const [selectedFile, setSelectedFile] = useState<FileType>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([
    { field: 'nome', columnName: '' },
    { field: 'codigoBarras', columnName: '' },
    { field: 'quantidade', columnName: '' },
    { field: 'validade', columnName: '' },
    { field: 'categoria', columnName: '' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!['csv', 'xls', 'xlsx'].includes(fileExtension || '')) {
      toast.error('Formato de arquivo não suportado. Use CSV, XLS ou XLSX.');
      return;
    }

    setSelectedFile(file);
    toast.success('Arquivo selecionado com sucesso!');
  };

  const updateColumnMapping = (index: number, columnName: string) => {
    const updatedMappings = [...columnMappings];
    updatedMappings[index].columnName = columnName;
    setColumnMappings(updatedMappings);
  };

  const handleImport = () => {
    // Validar mapeamento de colunas
    const emptyMappings = columnMappings.filter(mapping => mapping.columnName === '');
    if (emptyMappings.length > 0) {
      toast.error('Por favor, mapeie todas as colunas antes de importar.');
      return;
    }

    if (!selectedFile) {
      toast.error('Selecione um arquivo para importar.');
      return;
    }

    setIsUploading(true);
    
    // Simular processamento do arquivo
    setTimeout(() => {
      // Simular armazenamento no localStorage
      const historico = JSON.parse(localStorage.getItem('importacoes') || '[]');
      const novaImportacao = {
        id: `imp-${Date.now()}`,
        data: new Date().toISOString(),
        metodo: 'upload',
        quantidade: Math.floor(Math.random() * 100) + 10, // Aleatório para simulação
        status: 'Sucesso',
        arquivo: selectedFile.name
      };
      
      historico.unshift(novaImportacao);
      localStorage.setItem('importacoes', JSON.stringify(historico.slice(0, 20)));
      
      setIsUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      toast.success('Dados importados com sucesso!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="fileUpload">Arquivo para Importação</Label>
              <div className="flex gap-2">
                <Input 
                  ref={fileInputRef}
                  id="fileUpload" 
                  type="file" 
                  accept=".csv,.xls,.xlsx" 
                  onChange={handleFileChange} 
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Selecionar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Formatos suportados: CSV, XLS, XLSX
              </p>
            </div>
            
            {selectedFile && (
              <div className="bg-muted p-3 rounded-md">
                <p className="font-medium">Arquivo selecionado:</p>
                <p className="text-sm">{selectedFile.name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {selectedFile && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold text-lg mb-4">Mapeamento de Colunas</h3>
            
            <div className="space-y-4">
              {columnMappings.map((mapping, index) => (
                <div key={mapping.field} className="grid grid-cols-2 gap-4 items-center">
                  <Label htmlFor={`mapping-${mapping.field}`}>
                    {mapping.field === 'nome' ? 'Nome do Produto' : 
                     mapping.field === 'codigoBarras' ? 'Código de Barras' :
                     mapping.field === 'quantidade' ? 'Quantidade' :
                     mapping.field === 'validade' ? 'Data de Vencimento' : 'Categoria'}
                  </Label>
                  <Input
                    id={`mapping-${mapping.field}`}
                    placeholder="Nome da coluna no arquivo"
                    value={mapping.columnName}
                    onChange={(e) => updateColumnMapping(index, e.target.value)}
                  />
                </div>
              ))}
              
              <Button 
                className="w-full mt-4" 
                onClick={handleImport}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>Processando...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Dados
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadManual;
