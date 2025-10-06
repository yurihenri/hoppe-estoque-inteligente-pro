
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import { ProdutoFormWrapper } from "@/components/produtos/ProdutoFormWrapper";
import { useAuth } from "@/contexts/AuthContext";
import { Produto } from "@/types";
import { normalizeProduto } from "@/utils/normalizeData";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";

const Produtos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  useEffect(() => {
    if (user?.empresaId) {
      fetchProdutos();
    }
  }, [user]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("produtos")
        .select(`
          *,
          categorias:categoria_id (
            id,
            nome,
            cor
          )
        `)
        .eq("empresa_id", user?.empresaId)
        .order("nome");

      if (error) {
        throw error;
      }

      const normalizedProdutos = data?.map(produto => normalizeProduto(produto)) || [];
      setProdutos(normalizedProdutos);
    } catch (error) {
      toast("Não foi possível carregar os produtos", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setSelectedProduto(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (produto: Produto) => {
    setSelectedProduto(produto);
    setIsFormOpen(true);
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Produtos">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button 
            onClick={handleOpenNewForm}
            disabled={!user?.empresaId}
            title={!user?.empresaId ? "Configure uma empresa antes de criar produtos" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>

        {!user?.empresaId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Você precisa estar associado a uma empresa para gerenciar produtos.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p>Carregando produtos...</p>
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? "Nenhum produto encontrado" : "Nenhum produto cadastrado"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm 
                    ? "Tente ajustar os termos da pesquisa" 
                    : "Comece cadastrando seu primeiro produto"
                  }
                </p>
                {!searchTerm && (
                  <Button onClick={handleOpenNewForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Produto
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProdutos.map((produto) => (
                  <div 
                    key={produto.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOpenEditForm(produto)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{produto.nome}</h3>
                        {produto.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{produto.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Estoque: {produto.estoqueAtual}</span>
                          <span>Preço: R$ {produto.preco.toFixed(2)}</span>
                          {produto.categoria && (
                            <span className="px-2 py-1 rounded text-xs" style={{
                              backgroundColor: produto.categoria.cor + '20',
                              color: produto.categoria.cor
                            }}>
                              {produto.categoria.nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <ProdutoFormWrapper
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        produto={selectedProduto}
        onSubmitSuccess={fetchProdutos}
      />
    </Layout>
  );
};

export default Produtos;
