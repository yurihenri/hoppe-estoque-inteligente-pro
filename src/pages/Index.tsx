
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { normalizeProduto } from "@/utils/normalizeData";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch dashboard data when user is authenticated
    if (user && !isLoading) {
      queryClient.prefetchQuery({
        queryKey: ['dashboardData'],
        queryFn: async () => {
          const { data: produtos } = await supabase
            .from('produtos')
            .select(`
              *,
              categoria:categorias(id, nome, cor)
            `);
          
          return produtos?.map(normalizeProduto) || [];
        },
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [user, isLoading, queryClient]);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-t-hoppe-600"></div>
        <p className="text-lg text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
