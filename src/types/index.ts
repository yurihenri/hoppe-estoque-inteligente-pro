
// Tipos para o sistema Hoppe

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo?: string;
  avatarUrl?: string;
  empresaId: string;
  empresa?: Empresa;
  createdAt: string;
}

export type Permissao = 
  | 'admin'
  | 'gerente'
  | 'estoquista'
  | 'visualizador';

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  logo?: string;
  segmento?: string;
  endereco?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  cor: string;
  descricao?: string;
  parentId?: string;
  empresaId: string;
  createdAt?: string;
}

export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  codigoBarras?: string;
  preco: number;
  imagem?: string;
  categoriaId?: string;
  empresaId: string;
  unidade: string;
  estoqueMinimo: number;
  estoqueAtual: number;
  validade?: string; // ISO date string
  dataEntrada: string; // ISO date string
  codigoRastreio?: string;
  categoria?: Categoria; // Add this property for the joined category data
}

export interface Lote {
  id: string;
  produtoId: string;
  quantidade: number;
  dataFabricacao: Date;
  dataValidade: Date;
  numeroLote: string;
  localArmazenamento?: string;
  empresaId: string;
  status: StatusLote;
}

export type StatusLote = 
  | 'normal'
  | 'proxVencimento'  // Próximo ao vencimento
  | 'vencido';

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  produtoId: string;
  loteId?: string;
  quantidade: number;
  data: Date;
  responsavelId: string;
  motivo?: string;
  empresaId: string;
}

export interface Alerta {
  id: string;
  tipo: 'vencimento' | 'estoqueBaixo';
  produtoId: string;
  loteId?: string;
  mensagem: string;
  data: Date;
  lido: boolean;
  empresaId: string;
}

export interface DadosDashboard {
  totalProdutos: number;
  produtosVencidos: number;
  produtosAVencer: number; // produtos que vencem em até 7 dias
  distribuicaoCategorias: {categoria: string, quantidade: number}[];
  distribuicaoValidade: {status: string, quantidade: number}[];
  alertas: Alerta[];
}
