
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, isAfter } from "date-fns";

export interface ValidityAlert {
  id: string;
  nome: string;
  validade: string;
  daysUntilExpiry: number;
}

export const useValidityAlerts = () => {
  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['validityAlerts'],
    queryFn: async () => {
      const today = new Date();
      const alertThreshold = addDays(today, 7); // 7 dias de antecedência

      // Buscar produtos com validade próxima ou vencida
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select('id, nome, validade')
        .not('validade', 'is', null)
        .lte('validade', alertThreshold.toISOString().split('T')[0])
        .order('validade');

      if (error) throw error;

      // Processar produtos para calcular dias até o vencimento
      const processedAlerts: ValidityAlert[] = produtos.map(produto => {
        const validityDate = new Date(produto.validade!);
        const diffTime = validityDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          id: produto.id,
          nome: produto.nome,
          validade: produto.validade!,
          daysUntilExpiry
        };
      });

      return processedAlerts;
    },
    refetchInterval: 5 * 60 * 1000, // Recarregar a cada 5 minutos
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Separar alertas por tipo
  const expiredProducts = alerts?.filter(alert => alert.daysUntilExpiry < 0) || [];
  const soonToExpireProducts = alerts?.filter(alert => alert.daysUntilExpiry >= 0) || [];
  
  const hasAlerts = (alerts?.length || 0) > 0;
  const totalAlerts = alerts?.length || 0;

  return {
    alerts: alerts || [],
    expiredProducts,
    soonToExpireProducts,
    hasAlerts,
    totalAlerts,
    isLoading,
    error
  };
};
