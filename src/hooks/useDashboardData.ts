import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { addDays, isBefore, isAfter } from "date-fns";
import { normalizeProduto } from "@/utils/normalizeData";
import { useAuth } from "@/contexts/AuthContext";

export const useDashboardData = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboardData', user?.empresaId],
    enabled: !!user?.empresaId,
    queryFn: async () => {
      if (!user?.empresaId) {
        console.warn('[useDashboardData] empresaId não encontrado');
        return {
          produtos: [],
          stats: {
            totalProdutos: 0,
            produtosVencidos: 0,
            produtosAVencer: 0,
            produtosEstoqueBaixo: 0,
            produtosSemCategoria: 0
          },
          produtosVencidos: [],
          produtosAVencer: [],
          produtosEstoqueBaixo: []
        };
      }

      console.log('[useDashboardData] Buscando dados para empresa:', user.empresaId);

      const { data: produtos, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias(id, nome, cor)
        `)
        .eq('empresa_id', user.empresaId);
      
      if (error) {
        console.error('[useDashboardData] Erro ao buscar produtos:', error);
        throw error;
      }
      
      const today = new Date();
      const nextWeek = addDays(today, 7);
      
      const normalizedProdutos = produtos?.map(normalizeProduto) || [];
      
      // Calculate all statistics
      const totalProdutos = normalizedProdutos.length;
      
      const produtosVencidos = normalizedProdutos.filter(produto => 
        produto.validade && isBefore(new Date(produto.validade), today)
      );
      
      const produtosAVencer = normalizedProdutos.filter(produto => 
        produto.validade && 
        isAfter(new Date(produto.validade), today) && 
        isBefore(new Date(produto.validade), nextWeek)
      );
      
      const produtosEstoqueBaixo = normalizedProdutos.filter(produto => 
        (produto as any).quantidade <= 5
      );
      
      const produtosSemCategoria = normalizedProdutos.filter(produto => 
        !produto.categoriaId
      );
      
      return {
        produtos: normalizedProdutos,
        stats: {
          totalProdutos,
          produtosVencidos: produtosVencidos.length,
          produtosAVencer: produtosAVencer.length,
          produtosEstoqueBaixo: produtosEstoqueBaixo.length,
          produtosSemCategoria: produtosSemCategoria.length
        },
        produtosVencidos,
        produtosAVencer,
        produtosEstoqueBaixo
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });
};
