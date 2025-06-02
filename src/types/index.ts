
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

// Missing types that are imported elsewhere
export interface Alerta {
  id: string;
  tipo: string;
  mensagem: string;
  produtoId?: string;
  empresaId: string;
  lida: boolean;
  createdAt: string;
}

export interface DadosDashboard {
  totalProdutos: number;
  produtosComEstoqueBaixo: number;
  produtosVencendo: number;
  valorTotalEstoque: number;
}

export interface Lote {
  id: string;
  produtoId: string;
  quantidade: number;
  dataEntrada: string;
  validade?: string;
  status: StatusLote;
}

export interface StatusLote {
  id: string;
  nome: string;
  cor: string;
}

export interface Movimentacao {
  id: string;
  produtoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  observacao?: string;
}

export interface CategoriaSimples {
  id: string;
  nome: string;
  cor: string;
}
