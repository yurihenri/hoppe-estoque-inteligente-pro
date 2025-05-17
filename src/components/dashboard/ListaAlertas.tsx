
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, addDays, isBefore, isAfter } from "date-fns";
import { pt } from "date-fns/locale";
import { normalizeProduto } from "@/utils/normalizeData";
import { Produto } from "@/types";

const ListaAlertas: React.FC = () => {
  const { data: alertas, isLoading } = useQuery({
    queryKey: ['alertasProdutos'],
    queryFn: async () => {
      // Fetch produtos that are expired or close to expiration
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
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
        .not('validade', 'is', null)
        .order('validade');
        
      if (error) throw error;
      
      // Normalize and filter produtos
      const produtos = produtosData.map((produto) => {
        const normalizedProduto = normalizeProduto(produto);
        return {
          ...normalizedProduto,
          categoria: produto.categorias,
        };
      });
      
      const alertasProdutos = produtos.filter(produto => {
        if (!produto.validade) return false;
        const validadeDate = new Date(produto.validade);
        return isBefore(validadeDate, nextWeek);
      });
      
      return alertasProdutos;
    }
  });

  const renderAlertaItem = (produto: Produto & { categoria?: any }) => {
    const validadeDate = produto.validade ? new Date(produto.validade) : null;
    const isVencido = validadeDate && isBefore(validadeDate, new Date());
    
    return (
      <div 
        key={produto.id}
        className={`flex items-center justify-between p-3 rounded-lg mb-2 ${
          isVencido 
            ? 'bg-erro-50 border border-erro-100' 
            : 'bg-alerta-50 border border-alerta-100'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isVencido ? 'bg-erro-100' : 'bg-alerta-100'} mr-3`}>
            {isVencido ? (
              <AlertTriangle size={16} className="text-erro-500" />
            ) : (
              <Package size={16} className="text-alerta-500" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{produto.nome}</h4>
            <p className="text-sm text-muted-foreground">
              {isVencido ? 'Vencido em: ' : 'Vence em: '}
              {produto.validade 
                ? format(new Date(produto.validade), 'dd/MM/yyyy', { locale: pt })
                : 'Data desconhecida'
              }
            </p>
          </div>
        </div>
        
        {produto.categoria && (
          <div 
            className="px-2 py-1 rounded text-xs font-medium"
            style={{
              backgroundColor: `${produto.categoria.cor}20`, // Adiciona transparência à cor
              color: produto.categoria.cor
            }}
          >
            {produto.categoria.nome}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Alertas de Validade</span>
          {!isLoading && alertas && (
            <span className="bg-alerta-100 text-alerta-700 text-xs px-2 py-1 rounded-full">
              {alertas.length} itens
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Carregando alertas...</div>
        ) : !alertas || alertas.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum alerta de validade no momento
          </div>
        ) : (
          <div className="space-y-1">
            {alertas.map(produto => renderAlertaItem(produto))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListaAlertas;
