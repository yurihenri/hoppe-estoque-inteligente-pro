
import { useState } from "react";
import { Categoria } from "@/types";
import { Box, Edit, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CategoriasListProps {
  categorias: Categoria[];
  loading: boolean;
  searchTerm: string;
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
  onNew: () => void;
}

export const CategoriasList = ({
  categorias,
  loading,
  searchTerm,
  onEdit,
  onDelete,
  onNew,
}: CategoriasListProps) => {
  const filteredCategorias = categorias.filter(categoria =>
    categoria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categoria.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-hoppe-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (filteredCategorias.length === 0) {
    return (
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
            onClick={onNew} 
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        )}
      </div>
    );
  }

  return (
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
                    onClick={() => onEdit(categoria)}
                  >
                    <Edit size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(categoria)}
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
  );
};
