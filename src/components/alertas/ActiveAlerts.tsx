
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Package, Clock, X, Check, Plus } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Produto, Alerta } from '@/types';
import { normalizeProduto } from '@/utils/normalizeData';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ActiveAlertsProps {
  loading: boolean;
}

const ActiveAlerts: React.FC<ActiveAlertsProps> = ({ loading }) => {
  const [selectedAlert, setSelectedAlert] = useState<Produto | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);

  // Get active alerts (products close to expiring or with low stock)
  const { data: activeAlerts, isLoading } = useQuery({
    queryKey: ['activeAlerts'],
    queryFn: async () => {
      const today = new Date();
      const nextTwoWeeks = addDays(today, 14);
      
      // Fetch products that are expiring soon or with low stock
      const { data: produtosData, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nome,
            cor
          )
        `)
        .or(`validade.lt.${nextTwoWeeks.toISOString()},quantidade.lt.10`)
        .order('validade');
        
      if (error) throw error;
      
      // Normalize produtos
      const produtos = produtosData.map(produto => normalizeProduto(produto));
      
      return produtos;
    }
  });

  const handleResolveAlert = (action: string) => {
    if (!selectedAlert) return;

    // Here you would update the alert status in the database
    // For now, we'll just show a toast
    toast.success(`Alerta para ${selectedAlert.nome} marcado como ${action}`);
    setActionDialogOpen(false);
    setSelectedAlert(null);
  };

  const handleActionClick = (produto: Produto) => {
    setSelectedAlert(produto);
    setActionDialogOpen(true);
  };

  const renderAlertItem = (produto: Produto) => {
    const validadeDate = produto.validade ? new Date(produto.validade) : null;
    const isVencido = validadeDate && isBefore(validadeDate, new Date());
    const isEstoqueBaixo = produto.estoqueAtual < 10;
    
    return (
      <div 
        key={produto.id}
        className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
          isVencido 
            ? 'bg-erro-50 border border-erro-100' 
            : isEstoqueBaixo 
              ? 'bg-alerta-50 border border-alerta-100'
              : 'bg-muted border'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${
            isVencido 
              ? 'bg-erro-100'
              : isEstoqueBaixo
                ? 'bg-alerta-100'
                : 'bg-muted-foreground/10'
            } mr-3`}
          >
            {isVencido ? (
              <AlertTriangle size={16} className="text-erro-500" />
            ) : isEstoqueBaixo ? (
              <Package size={16} className="text-alerta-500" />
            ) : (
              <Clock size={16} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{produto.nome}</h4>
            <div className="text-sm text-muted-foreground flex flex-col gap-1">
              {validadeDate && (
                <p>
                  {isVencido ? 'Vencido em: ' : 'Vence em: '}
                  {format(validadeDate, 'dd/MM/yyyy', { locale: pt })}
                </p>
              )}
              {isEstoqueBaixo && (
                <p>Estoque baixo: {produto.estoqueAtual} unidades</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {produto.categoria && (
            <div 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: `${produto.categoria.cor}20`,
                color: produto.categoria.cor
              }}
            >
              {produto.categoria.nome}
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleActionClick(produto)}
          >
            Ações
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          {isLoading || loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando alertas...</div>
          ) : !activeAlerts || activeAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-4">
              <div className="p-4 bg-muted rounded-full">
                <Check size={24} className="text-hoppe-500" />
              </div>
              <div>
                <h3 className="font-medium">Nenhum alerta ativo</h3>
                <p className="text-sm">Todos os produtos estão com estoque adequado e dentro da validade!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Alertas Ativos</h3>
                <span className="bg-alerta-100 text-alerta-700 text-xs px-2 py-1 rounded-full">
                  {activeAlerts.length} {activeAlerts.length === 1 ? 'alerta' : 'alertas'}
                </span>
              </div>
              {activeAlerts.map(produto => renderAlertItem(produto))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ações para {selectedAlert?.nome}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('reposto')}
            >
              <Plus className="h-4 w-4" />
              Criar pedido de reposição
            </Button>
            
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('ajustado')}
            >
              <Check className="h-4 w-4" />
              Marcar como ajustado
            </Button>
            
            <Button 
              className="flex items-center justify-start gap-2" 
              variant="outline"
              onClick={() => handleResolveAlert('descartado')}
            >
              <X className="h-4 w-4" />
              Marcar como descartado
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

export default ActiveAlerts;
