
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import { CategoriaForm } from "@/components/categorias/CategoriaForm";
import { useAuth } from "@/contexts/AuthContext";
import { Categoria } from "@/types";
import { normalizeCategoria } from "@/utils/normalizeData";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Box, Edit, Plus, Search, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Categorias = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);

  // Check if any products are using this category
  const [categoryInUseCount, setCategoryInUseCount] = useState(0);

  useEffect(() => {
    if (user?.empresaId) {
      fetchCategorias();
    }
  }, [user]);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("nome");

      if (error) {
        throw error;
      }

      const normalizedCategorias = data?.map(cat => normalizeCategoria(cat)) || [];
      setCategorias(normalizedCategorias);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast("Não foi possível carregar as categorias", {
        description: "Tente novamente mais tarde",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewForm = () => {
    setSelectedCategoria(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setIsFormOpen(true);
  };

  const handleDeleteCategoria = async (categoria: Categoria) => {
    // First, check if the category is in use
    try {
      const { count, error } = await supabase
        .from("produtos")
        .select("*", { count: "exact", head: true })
        .eq("categoria_id", categoria.id);
      
      if (error) throw error;
      
      setCategoryInUseCount(count || 0);
      setCategoriaToDelete(categoria);
      setDeleteConfirmOpen(true);
    } catch (error) {
      console.error("Erro ao verificar uso da categoria:", error);
      toast("Erro ao verificar uso da categoria", {
        description: "Não foi possível verificar se a categoria está sendo usada",
      });
    }
  };

  const confirmDelete = async () => {
    if (!categoriaToDelete) return;

    try {
      // If category is in use, remove the association from products first
      if (categoryInUseCount > 0) {
        const { error: updateError } = await supabase
          .from("produtos")
          .update({ categoria_id: null })
          .eq("categoria_id", categoriaToDelete.id);
        
        if (updateError) throw updateError;
      }

      // Then delete the category
      const { error } = await supabase
        .from("categorias")
        .delete()
        .eq("id", categoriaToDelete.id);

      if (error) throw error;

      setCategorias((prevCategorias) =>
        prevCategorias.filter((c) => c.id !== categoriaToDelete.id)
      );

      toast("Categoria excluída", {
        description: `A categoria ${categoriaToDelete.nome} foi excluída com sucesso.`,
      });

      // Show additional message if products were updated
      if (categoryInUseCount > 0) {
        toast("Produtos atualizados", {
          description: `${categoryInUseCount} produto(s) foram atualizados para "Sem categoria".`,
        });
      }
    } catch (error: any) {
      console.error("Erro ao excluir categoria:", error);
      toast("Erro ao excluir categoria", {
        description: error.message,
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoriaToDelete(null);
      setCategoryInUseCount(0);
    }
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout title="Categorias">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Button onClick={handleOpenNewForm}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar categorias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lista de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-hoppe-600 rounded-full border-t-transparent"></div>
              </div>
            ) : filteredCategorias.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cor</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategorias.map((categoria) => (
                      <TableRow key={categoria.id}>
                        <TableCell>
                          <div 
                            className="w-6 h-6 rounded-full" 
                            style={{ backgroundColor: categoria.cor }}
                          ></div>
                        </TableCell>
                        <TableCell className="font-medium">{categoria.nome}</TableCell>
                        <TableCell>{categoria.descricao || <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditForm(categoria)}
                            >
                              <Edit size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategoria(categoria)}
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
                <h3 className="text-lg font-medium">Nenhuma categoria encontrada</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm 
                    ? "Nenhuma categoria corresponde à sua busca."
                    : "Comece adicionando sua primeira categoria."}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleOpenNewForm} 
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Modal */}
      <CategoriaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categoria={selectedCategoria}
        onSubmitSuccess={fetchCategorias}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryInUseCount > 0 ? (
                <>
                  A categoria <strong>{categoriaToDelete?.nome}</strong> está sendo usada por {categoryInUseCount} produto(s).
                  <br /><br />
                  Ao excluir esta categoria, os produtos serão atualizados para "Sem categoria".
                </>
              ) : (
                <>
                  Tem certeza que deseja excluir a categoria <strong>{categoriaToDelete?.nome}</strong>?
                </>
              )}
              <br /><br />
              Esta ação não pode ser desfeita.
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

export default Categorias;
