
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { secureStorage } from '@/utils/secureStorage';

interface Importacao {
  id: string;
  data: string;
  metodo: string;
  quantidade: number;
  status: string;
  arquivo?: string;
  origem?: string;
}

const HistoricoImportacoes = () => {
  const [importacoes, setImportacoes] = useState<Importacao[]>([]);

  useEffect(() => {
    // Carregar histórico do secureStorage
    const historico = secureStorage.get('importacoes', false) || [];
    setImportacoes(historico);
  }, []);

  // Exportar histórico como CSV
  const exportarCSV = () => {
    if (importacoes.length === 0) return;

    // Criar conteúdo CSV
    const headers = ['ID', 'Data', 'Método', 'Quantidade', 'Status', 'Origem'];
    const csvContent = [
      headers.join(','),
      ...importacoes.map(imp => [
        imp.id,
        imp.data,
        imp.metodo,
        imp.quantidade,
        imp.status,
        imp.arquivo || imp.origem || 'N/A'
      ].join(','))
    ].join('\n');

    // Criar blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_importacoes_${Date.now()}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Histórico de Importações</h3>
        <Button variant="outline" size="sm" onClick={exportarCSV} disabled={importacoes.length === 0}>
          <Download className="mr-2 h-4 w-4" /> Exportar CSV
        </Button>
      </div>

      {importacoes.length > 0 ? (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Qtd. Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {importacoes.map((importacao) => (
                <TableRow key={importacao.id}>
                  <TableCell>
                    {format(new Date(importacao.data), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={importacao.metodo === 'upload' ? 'outline' : 'secondary'}>
                      {importacao.metodo === 'upload' ? 'Upload Manual' : 'API'}
                    </Badge>
                  </TableCell>
                  <TableCell>{importacao.quantidade}</TableCell>
                  <TableCell>
                    <Badge variant={importacao.status === 'Sucesso' ? 'default' : 'destructive'}>
                      {importacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {importacao.arquivo || importacao.origem || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-muted-foreground border rounded-md">
          Nenhum histórico de importação encontrado
        </div>
      )}
    </div>
  );
};

export default HistoricoImportacoes;
