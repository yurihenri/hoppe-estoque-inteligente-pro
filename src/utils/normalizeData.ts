
import { Categoria, Produto, Usuario, CategoriaSimples } from "@/types";

export const normalizeCategoria = (data: any): Categoria => ({
  id: data.id,
  nome: data.nome,
  descricao: data.descricao || undefined,
  cor: data.cor || '#3B82F6',
  parentId: data.parent_id || undefined,
  empresaId: data.empresa_id,
  createdAt: data.created_at,
});

export const normalizeProduto = (data: any): Produto => {
  // Handle categoria data that might come from a join (has simplified structure)
  let categoria = undefined;
  if (data.categorias) {
    // This is from a join query, create simplified categoria object
    categoria = {
      id: data.categorias.id,
      nome: data.categorias.nome,
      cor: data.categorias.cor
    };
  }
  
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao || undefined,
    codigoBarras: data.codigo_barras || undefined,
    preco: data.preco,
    imagem: data.imagem || undefined,
    categoriaId: data.categoria_id || undefined,
    empresaId: data.empresa_id,
    unidade: data.unidade || 'Un',
    estoqueMinimo: data.estoque_minimo || 0,
    estoqueAtual: data.quantidade || 0,
    validade: data.validade ? data.validade : undefined,
    dataEntrada: data.data_entrada || new Date().toISOString(),
    codigoRastreio: data.codigo_rastreio || undefined,
    categoria: categoria
  };
};

export const normalizeUsuario = (data: any): Usuario => ({
  id: data.id,
  nome: data.nome,
  email: data.email,
  empresaId: data.empresa_id,
  avatarUrl: data.avatar_url || undefined,
  cargo: data.cargo || undefined,
  createdAt: data.created_at,
});
