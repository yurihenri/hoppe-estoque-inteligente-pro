
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { parseCSV, validateImportedProducts, mapImportedToProducts, importProdutos } from '@/utils/import';
import { toast } from 'sonner';
import { Categoria } from '@/types';
import { AlertCircle, Loader2, FileUp } from 'lucide-react';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: Categoria[];
  empresaId: string;
  onSuccess: () => void;
}

const ImportDialog: React.FC<ImportDialogProps> = ({ 
  open, 
  onOpenChange, 
  categorias,
  empresaId,
  onSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check file type
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV');
        return;
      }
      
      setFile(selectedFile);
      setValidationErrors([]);
    }
  };
  
  const handleFileUpload = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Parse CSV file
      const parsedData = await parseCSV(file);
      
      // Validate data
      const validation = validateImportedProducts(parsedData);
      
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        setIsLoading(false);
        return;
      }
      
      setImportedData(parsedData);
      setStep('preview');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImport = async () => {
    setStep('importing');
    setIsLoading(true);
    
    try {
      // Map imported data to products
      const produtos = await mapImportedToProducts(importedData, empresaId, categorias);
      
      // Import products
      const success = await importProdutos(produtos);
      
      if (success) {
        onOpenChange(false);
        setFile(null);
        setImportedData([]);
        setValidationErrors([]);
        setStep('upload');
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      toast.error('Erro ao importar dados');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFile(null);
    setImportedData([]);
    setValidationErrors([]);
    setStep('upload');
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Importar Dados</DialogTitle>
          <DialogDescription>
            {step === 'upload' && "Selecione um arquivo CSV para importar dados de produtos."}
            {step === 'preview' && "Verifique os dados antes de confirmar a importação."}
            {step === 'importing' && "Importando dados..."}
          </DialogDescription>
        </DialogHeader>
        
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erros de validação</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {/* Upload Step */}
        {step === 'upload' && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4 items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arraste e solte um arquivo CSV aqui ou clique para selecionar
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="max-w-xs"
              />
              {file && (
                <p className="text-sm font-medium">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Preview Step */}
        {step === 'preview' && (
          <div className="grid gap-4 py-4 max-h-[400px] overflow-auto">
            <p className="text-sm text-muted-foreground">
              {importedData.length} produtos encontrados no arquivo
            </p>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Validade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedData.slice(0, 10).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.Nome}</TableCell>
                    <TableCell>{row.Categoria || 'N/A'}</TableCell>
                    <TableCell>{row['Preço'] || row['Preço Unitário'] || 'N/A'}</TableCell>
                    <TableCell>{row.Estoque || row['Estoque Atual'] || 'N/A'}</TableCell>
                    <TableCell>{row['Data de Validade'] || row.Validade || 'N/A'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {importedData.length > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Mostrando 10 de {importedData.length} produtos
              </p>
            )}
          </div>
        )}
        
        {/* Importing Step */}
        {step === 'importing' && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Importando dados...</p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          
          {step === 'upload' && (
            <Button onClick={handleFileUpload} disabled={!file || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando
                </>
              ) : (
                <>Continuar</>
              )}
            </Button>
          )}
          
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={isLoading}>
              Confirmar Importação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
