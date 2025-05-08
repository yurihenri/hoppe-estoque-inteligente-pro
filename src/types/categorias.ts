
import { Database } from "@/integrations/supabase/types";

export type DatabaseCategoria = Database["public"]["Tables"]["categorias"]["Row"];

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  parentId?: string;
  empresaId: string;
}

export const mapDbToCategoria = (dbCategoria: DatabaseCategoria): Categoria => ({
  id: dbCategoria.id,
  nome: dbCategoria.nome,
  cor: dbCategoria.cor || '#3B82F6',
  descricao: dbCategoria.descricao || undefined,
  parentId: dbCategoria.parent_id || undefined,
  empresaId: dbCategoria.empresa_id,
});

export interface CategoriasFormValues {
  nome: string;
  cor: string;
  descricao?: string;
  parentId?: string;
}
