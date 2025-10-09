
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produto, Categoria } from "@/types";
import { ProductBadge, StockBadge } from "./ProductBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { normalizeProduto } from "@/utils/normalizeData";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useAuth } from "@/contexts/AuthContext";

export const ListaProdutos: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch produtos
  const { data: produtos, isLoading, error } = useQuery({
    queryKey: ['produtos', user?.empresaId],
    enabled: !!user?.empresaId,
    queryFn: async () => {
      if (!user?.empresaId) {
        console.warn('[ListaProdutos] empresaId não encontrado');
        return [];
      }

      console.log('[ListaProdutos] Buscando produtos para empresa:', user.empresaId);
      
      // Fetch produtos with categorias
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias:categoria_id (
            id,
            nome,
            cor
          )
        `)
        .eq('empresa_id', user.empresaId)
        .order('validade');

      if (produtosError) {
        console.error('[ListaProdutos] Erro ao buscar produtos:', produtosError);
        throw produtosError;
      }

      // Normalize data
      return produtosData.map((produto) => {
        const normalizedProduto = normalizeProduto(produto);
        const categoria = produto.categorias as unknown as Categoria;
        
        return {
          ...normalizedProduto,
          categoria
        };
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success("Produto excluído com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao excluir produto:", error);
      toast.error("Erro ao excluir produto");
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filtrar produtos com base no termo de busca (usando debounce)
  const filteredProdutos = produtos?.filter(produto => 
    produto.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    produto.descricao?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    produto.categoria?.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    produto.codigoRastreio?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    (produto.validade && format(new Date(produto.validade), 'dd/MM/yyyy').includes(debouncedSearchTerm))
  ) || [];

  if (!user?.empresaId) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Atenção:</strong> Você precisa estar associado a uma empresa para visualizar produtos.
        </p>
      </div>
    );
  }

  if (isLoading) return <div className="p-4">Carregando produtos...</div>;
  
  if (error) {
    console.error('[ListaProdutos] Erro ao renderizar:', error);
    return (
      <div className="p-4 text-erro-500">
        <p className="font-medium">Erro ao carregar produtos</p>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de busca aprimorada */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          placeholder="Buscar por nome, categoria, código ou data de validade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço</TableHead>
              <TableHead className="text-center">Estoque</TableHead>
              <TableHead className="text-center">Status Estoque</TableHead>
              <TableHead className="text-center">Validade</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos && filteredProdutos.length > 0 ? (
              filteredProdutos.map((produto) => (
                <TableRow 
                  key={produto.id}
                  className={produto.estoqueAtual <= 5 ? "bg-erro-50" : ""}
                >
                  <TableCell className="font-medium">{produto.nome}</TableCell>
                  <TableCell>
                    {produto.categoria ? (
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: produto.categoria.cor || '#3B82F6' }}
                        ></span>
                        {produto.categoria.nome}
                      </div>
                    ) : (
                      <div className="flex items-center text-erro-500">
                        <AlertCircle size={14} className="mr-1" />
                        <span>Sem categoria</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(produto.preco)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {produto.estoqueAtual}
                  </TableCell>
                  <TableCell className="text-center">
                    <StockBadge quantity={produto.estoqueAtual} />
                  </TableCell>
                  <TableCell className="text-center">
                    {produto.validade ? 
                      format(new Date(produto.validade), 'dd/MM/yyyy', {locale: pt}) : 
                      "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <ProductBadge validityDate={produto.validade} />
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(produto.id)}
                      className="text-erro-500 hover:text-erro-700 hover:bg-erro-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  {searchTerm ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Search size={24} className="text-muted-foreground mb-2" />
                      <p>Nenhum produto corresponde à sua busca</p>
                    </div>
                  ) : (
                    "Nenhum produto cadastrado"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
