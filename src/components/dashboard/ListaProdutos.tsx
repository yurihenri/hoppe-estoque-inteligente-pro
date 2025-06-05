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

export const ListaProdutos: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filtrar produtos com base no termo de busca
  const filteredProdutos = produtos?.filter(produto => 
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigoRastreio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (produto.validade && format(new Date(produto.validade), 'dd/MM/yyyy').includes(searchTerm))
  ) || [];

  if (isLoading) return <div className="p-4 text-white">Carregando produtos...</div>;
  if (error) return <div className="p-4 text-red-400">Erro ao carregar produtos</div>;

  return (
    <div className="space-y-4">
      {/* Barra de busca aprimorada */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <Input
          type="text"
          placeholder="Buscar por nome, categoria, código ou data de validade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full input-dark"
        />
      </div>
      
      <div className="rounded-md border border-slate-700 overflow-hidden">
        <Table className="table-dark">
          <TableHeader className="sticky top-0 bg-slate-800">
            <TableRow className="border-slate-700">
              <TableHead className="text-slate-200">Nome</TableHead>
              <TableHead className="text-slate-200">Categoria</TableHead>
              <TableHead className="text-right text-slate-200">Preço</TableHead>
              <TableHead className="text-center text-slate-200">Estoque</TableHead>
              <TableHead className="text-center text-slate-200">Status Estoque</TableHead>
              <TableHead className="text-center text-slate-200">Validade</TableHead>
              <TableHead className="text-center text-slate-200">Status</TableHead>
              <TableHead className="text-center text-slate-200">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProdutos && filteredProdutos.length > 0 ? (
              filteredProdutos.map((produto) => (
                <TableRow 
                  key={produto.id}
                  className={`border-slate-700 hover:bg-slate-700/30 transition-colors ${produto.estoqueAtual <= 5 ? "bg-red-900/20" : ""}`}
                >
                  <TableCell className="font-medium text-white">{produto.nome}</TableCell>
                  <TableCell>
                    {produto.categoria ? (
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: produto.categoria.cor || '#3B82F6' }}
                        ></span>
                        <span className="text-slate-200">{produto.categoria.nome}</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400">
                        <AlertCircle size={14} className="mr-1" />
                        <span>Sem categoria</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-white">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(produto.preco)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-white">
                    {produto.estoqueAtual}
                  </TableCell>
                  <TableCell className="text-center">
                    <StockBadge quantity={produto.estoqueAtual} />
                  </TableCell>
                  <TableCell className="text-center text-slate-200">
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
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-slate-400">
                  {searchTerm ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <Search size={24} className="text-slate-400 mb-2" />
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
