
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produto, Categoria } from "@/types";
import { ProductBadge } from "./ProductBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { toast } from "sonner";
import { normalizeProduto } from "@/utils/normalizeData";

export const ListaProdutos: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch produtos
  const { data: produtos, isLoading, error } = useQuery({
    queryKey: ['produtos'],
    queryFn: async () => {
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
        .order('validade');

      if (produtosError) throw produtosError;

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

  if (isLoading) return <div className="p-4">Carregando produtos...</div>;
  if (error) return <div className="p-4 text-erro-500">Erro ao carregar produtos</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Preço</TableHead>
            <TableHead className="text-center">Estoque</TableHead>
            <TableHead className="text-center">Validade</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produtos && produtos.length > 0 ? (
            produtos.map((produto) => (
              <TableRow key={produto.id}>
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
                    "Sem categoria"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(produto.preco)}
                </TableCell>
                <TableCell className="text-center">{produto.estoqueAtual}</TableCell>
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
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                Nenhum produto cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
