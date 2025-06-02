
import { Plan } from './plans';

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  segmento?: string;
  currentPlan?: Plan;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  empresaId: string;
  avatarUrl?: string;
  cargo?: string;
  createdAt: string;
  empresa?: Empresa;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  empresaId: string;
  parentId?: string;
  createdAt: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoqueAtual: number;
  estoqueMinimo: number;
  validade?: string;
  dataEntrada: string;
  codigoRastreio?: string;
  categoriaId?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  categoria?: Categoria;
}
