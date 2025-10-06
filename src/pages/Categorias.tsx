
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import Layout from "@/components/layout/Layout";
import { CategoriaForm } from "@/components/categorias/CategoriaForm";
import { CategoriasList } from "@/components/categorias/CategoriasList";
import { CategoriaSearch } from "@/components/categorias/CategoriaSearch";
import { DeleteCategoriaDialog } from "@/components/categorias/DeleteCategoriaDialog";
import { useAuth } from "@/contexts/AuthContext";
import { Categoria } from "@/types";
import { normalizeCategoria } from "@/utils/normalizeData";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const Categorias = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<Categoria | null>(null);
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
      toast("Erro ao excluir categoria", {
        description: error.message,
      });
    } finally {
      setDeleteConfirmOpen(false);
      setCategoriaToDelete(null);
      setCategoryInUseCount(0);
    }
  };

  return (
    <Layout title="Categorias">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Categorias</h1>
          <Button 
            onClick={handleOpenNewForm}
            disabled={!user?.empresaId}
            title={!user?.empresaId ? "Configure uma empresa antes de criar categorias" : ""}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {!user?.empresaId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Atenção:</strong> Você precisa estar associado a uma empresa para gerenciar categorias.
            </p>
          </div>
        )}

        <CategoriaSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Lista de Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoriasList
              categorias={categorias}
              loading={loading}
              searchTerm={searchTerm}
              onEdit={handleOpenEditForm}
              onDelete={handleDeleteCategoria}
              onNew={handleOpenNewForm}
            />
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
      <DeleteCategoriaDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        categoria={categoriaToDelete}
        inUseCount={categoryInUseCount}
        onConfirm={confirmDelete}
      />
    </Layout>
  );
};

export default Categorias;
