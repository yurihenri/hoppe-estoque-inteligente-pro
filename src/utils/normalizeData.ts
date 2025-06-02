
import { Categoria, CategoriaSimples, Produto } from "@/types";

export const normalizeCategoria = (data: any): Categoria => {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao || undefined,
    cor: data.cor,
    empresaId: data.empresa_id,
    parentId: data.parent_id || undefined,
    createdAt: data.created_at
  };
};

export const normalizeCategoriaSimples = (data: any): CategoriaSimples => {
  return {
    id: data.id,
    nome: data.nome,
    cor: data.cor
  };
};

export const normalizeProduto = (data: any): Produto => {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao || undefined,
    preco: data.preco,
    estoqueAtual: data.quantidade,
    estoqueMinimo: data.estoque_minimo || 0,
    validade: data.validade || undefined,
    dataEntrada: data.data_entrada,
    codigoRastreio: data.codigo_rastreio || undefined,
    categoriaId: data.categoria_id || undefined,
    empresaId: data.empresa_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at || data.created_at,
    categoria: data.categoria ? normalizeCategoria(data.categoria) : undefined
  };
};
