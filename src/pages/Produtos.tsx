
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import Layout from '@/components/layout/Layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ProdutoForm } from '@/components/produtos/ProdutoForm';
import { Box, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';

interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  validade: string | null;
  codigo_rastreio: string | null;
  categoria_id: string | null;
  descricao: string | null;
  data_entrada: string;
  categoria: {
    id: string;
    nome: string;
    cor: string;
  } | null;
}

const Produtos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [produtoToDelete, setProdutoToDelete] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.empresaId) {
      fetchProdutos();
    }
  }, [user]);

  const fetchProdutos = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categoria_id (
            id,
            nome,
            cor
          )
        `)
        .order('nome');

      if (error) {
        throw error;
      }

      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast('Não foi possível carregar os produtos.', {
        description: 'Tente novamente mais tarde.'
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

  const handleDeleteProduto = (produto: Produto) => {
    setProdutoToDelete(produto);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!produtoToDelete) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', produtoToDelete.id);

      if (error) throw error;

      setProdutos((prevProdutos) =>
        prevProdutos.filter((p) => p.id !== produtoToDelete.id)
      );

      toast('Produto excluído', {
        description: `O produto ${produtoToDelete.nome} foi excluído com sucesso.`
      });
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error);
      toast('Erro ao excluir produto', {
        description: error.message
      });
    } finally {
      setDeleteConfirmOpen(false);
      setProdutoToDelete(null);
    }
  };

  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.codigo_rastreio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.categoria?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Layout title="Produtos">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <Button onClick={handleOpenNewForm}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Produto
          </Button>
        </div>
        
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lista de Produtos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-hoppe-600 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredProdutos.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProdutos.map((produto) => (
                      <TableRow key={produto.id}>
                        <TableCell className="font-medium">{produto.nome}</TableCell>
                        <TableCell>
                          {produto.categoria ? (
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: produto.categoria.cor }}
                              />
                              {produto.categoria.nome}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sem categoria</span>
                          )}
                        </TableCell>
                        <TableCell>{formatCurrency(produto.preco)}</TableCell>
                        <TableCell>{produto.quantidade}</TableCell>
                        <TableCell>
                          {produto.validade ? (
                            format(new Date(produto.validade), 'dd/MM/yyyy', { locale: ptBR })
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {produto.codigo_rastreio || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditForm(produto)}
                            >
                              <Edit size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduto(produto)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Box className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm 
                    ? "Nenhum produto corresponde à sua busca."
                    : "Comece adicionando seu primeiro produto."}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleOpenNewForm} 
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <ProdutoForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        produto={selectedProduto}
        onSubmitSuccess={fetchProdutos}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <strong>{produtoToDelete?.nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Produtos;
