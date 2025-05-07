
import { Database } from "@/integrations/supabase/types";

// Types for the Categorias module
export type CategoriaRow = Database['public']['Tables']['categorias']['Row'];
export type CategoriaInsert = Database['public']['Tables']['categorias']['Insert'];
export type CategoriaUpdate = Database['public']['Tables']['categorias']['Update'];

// Application-specific type that maps to our UI needs
export interface Categoria {
  id: string;
  nome: string;
  descricao?: string | null;
  cor: string | null;
  empresaId: string;
  parentId?: string | null;
  createdAt: string;
}

// Helper to convert database row to UI model
export function mapDbToCategoria(row: CategoriaRow): Categoria {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    cor: row.cor || '#3B82F6',
    empresaId: row.empresa_id,
    parentId: row.parent_id,
    createdAt: row.created_at
  };
}

// Helper to convert UI model to database insert
export function mapCategoriaToInsert(categoria: Omit<Categoria, 'id' | 'createdAt'>): CategoriaInsert {
  return {
    nome: categoria.nome,
    descricao: categoria.descricao,
    cor: categoria.cor,
    empresa_id: categoria.empresaId,
    parent_id: categoria.parentId
  };
}

// Helper to convert UI model to database update
export function mapCategoriaToUpdate(categoria: Partial<Omit<Categoria, 'id' | 'createdAt'>>): CategoriaUpdate {
  const update: CategoriaUpdate = {};
  
  if (categoria.nome !== undefined) update.nome = categoria.nome;
  if (categoria.descricao !== undefined) update.descricao = categoria.descricao;
  if (categoria.cor !== undefined) update.cor = categoria.cor;
  if (categoria.parentId !== undefined) update.parent_id = categoria.parentId;
  
  return update;
}
