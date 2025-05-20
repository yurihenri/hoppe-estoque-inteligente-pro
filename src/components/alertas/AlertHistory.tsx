
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { AlertTriangle, Package, FileDown, Search, X, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

// Define mock data for alerts history
interface AlertHistoryItem {
  id: string;
  productId: string;
  productName: string;
  type: 'quantidade' | 'validade';
  alertDate: string;
  status: 'pendente' | 'resolvido';
  actionTaken?: string;
  resolvedDate?: string;
}

const mockAlertHistory: AlertHistoryItem[] = [
  {
    id: '1',
    productId: 'p1',
    productName: 'Paracetamol 500mg',
    type: 'quantidade',
    alertDate: '2025-05-15T10:30:00Z',
    status: 'resolvido',
    actionTaken: 'Estoque reposto',
    resolvedDate: '2025-05-16T14:20:00Z'
  },
  {
    id: '2',
    productId: 'p2',
    productName: 'Vitamina C 1000mg',
    type: 'validade',
    alertDate: '2025-05-14T08:15:00Z',
    status: 'resolvido',
    actionTaken: 'Produto descartado',
    resolvedDate: '2025-05-14T16:40:00Z'
  },
  {
    id: '3',
    productId: 'p3',
    productName: 'Ibuprofeno 400mg',
    type: 'quantidade',
    alertDate: '2025-05-18T09:45:00Z',
    status: 'pendente'
  },
  {
    id: '4',
    productId: 'p4',
    productName: 'Dipirona 500mg',
    type: 'validade',
    alertDate: '2025-05-17T11:20:00Z',
    status: 'pendente'
  },
  {
    id: '5',
    productId: 'p5',
    productName: 'Omeprazol 20mg',
    type: 'quantidade',
    alertDate: '2025-05-16T13:10:00Z',
    status: 'pendente'
  }
];

const AlertHistory: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<AlertHistoryItem | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [alerts] = useState<AlertHistoryItem[]>(mockAlertHistory);

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'todos' || 
                          (filter === 'pendentes' && alert.status === 'pendente') || 
                          (filter === 'resolvidos' && alert.status === 'resolvido') ||
                          (filter === 'quantidade' && alert.type === 'quantidade') ||
                          (filter === 'validade' && alert.type === 'validade');
    
    const matchesSearch = searchTerm === '' || 
                          alert.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleResolveAlert = (action: string) => {
    if (!selectedAlert) return;
    
    // In a real app, this would update the database
    // For now, we'll just show a toast message
    toast.success(`Alerta para ${selectedAlert.productName} marcado como resolvido: ${action}`);
    setActionDialogOpen(false);
    setSelectedAlert(null);
  };

  const handleExportCSV = () => {
    // In a real app, this would generate and download a CSV file
    toast.success('Exportando histórico em CSV...');
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex w-full sm:w-2/3 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do produto..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os alertas</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="resolvidos">Resolvidos</SelectItem>
                <SelectItem value="quantidade">Estoque baixo</SelectItem>
                <SelectItem value="validade">Validade</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleExportCSV}
          >
            <FileDown size={16} />
            <span>Exportar CSV</span>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data do Alerta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhum alerta encontrado com os filtros atuais
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map(alert => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.productName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {alert.type === 'quantidade' ? (
                            <Package size={16} className="text-hoppe-500" />
                          ) : (
                            <AlertTriangle size={16} className="text-alerta-500" />
                          )}
                          {alert.type === 'quantidade' ? 'Estoque baixo' : 'Validade próxima'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(alert.alertDate), 'dd/MM/yyyy HH:mm', { locale: pt })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'pendente' ? 'outline' : 'default'}>
                          {alert.status === 'pendente' ? 'Pendente' : 'Resolvido'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.status === 'pendente' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAlert(alert);
                              setActionDialogOpen(true);
                            }}
                          >
                            Resolver
                          </Button>
                        ) : (
                          <span className="text-sm text-muted-foreground">{alert.actionTaken}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta para {selectedAlert?.productName}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('Estoque reposto')}
            >
              <Check className="h-4 w-4" />
              Estoque reposto
            </Button>
            
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('Produto ajustado')}
            >
              <Check className="h-4 w-4" />
              Produto ajustado
            </Button>
            
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('Produto descartado')}
            >
              <X className="h-4 w-4" />
              Produto descartado
            </Button>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertHistory;
