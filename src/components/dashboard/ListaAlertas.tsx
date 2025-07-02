
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
      
      // Normalize produtos - the normalization function now handles joined categoria data
      const produtos = produtosData.map(produto => normalizeProduto(produto));
      
      // Filter produtos
      const alertasProdutos = produtos.filter(produto => {
        if (!produto.validade) return false;
        const validadeDate = new Date(produto.validade);
        return isBefore(validadeDate, nextWeek);
      });
      
      return alertasProdutos;
    }
  });

  const renderAlertaItem = (produto: Produto) => {
    const validadeDate = produto.validade ? new Date(produto.validade) : null;
    const isVencido = validadeDate && isBefore(validadeDate, new Date());
    
    return (
      <div 
        key={produto.id}
        className={`flex items-center justify-between p-3 rounded-lg mb-2 transition-all duration-200 ${
          isVencido 
            ? 'bg-red-50 border border-red-200' 
            : 'bg-yellow-50 border border-yellow-200'
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isVencido ? 'bg-red-100' : 'bg-yellow-100'} mr-3`}>
            {isVencido ? (
              <AlertTriangle size={16} className="text-red-600" />
            ) : (
              <Package size={16} className="text-yellow-600" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{produto.nome}</h4>
            <p className="text-sm text-gray-600">
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
              backgroundColor: `${produto.categoria.cor}20`,
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
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between text-gray-900">
          <span>Alertas de Validade</span>
          {!isLoading && alertas && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full border border-gray-200">
              {alertas.length} itens
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Carregando alertas...</div>
        ) : !alertas || alertas.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
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
