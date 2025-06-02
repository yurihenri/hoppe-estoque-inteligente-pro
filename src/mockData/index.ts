
import { Alerta, Categoria, DadosDashboard, Empresa, Lote, Movimentacao, Produto, StatusLote, Usuario } from "../types";

// Mock Empresa
export const mockEmpresa: Empresa = {
  id: "1",
  nome: "Farmácia Central",
  cnpj: "12.345.678/0001-90",
  segmento: "Farmácia"
};

// Mock Usuários
export const mockUsuarios: Usuario[] = [
  {
    id: "1",
    nome: "João Silva",
    email: "joao@farmaciacentral.com",
    empresaId: "1",
    cargo: "Gerente",
    createdAt: "2024-01-01T00:00:00Z"
  }
];

// Mock Categorias
export const mockCategorias: Categoria[] = [
  { id: "1", nome: "Medicamentos", cor: "#FF6B6B", descricao: "Produtos farmacêuticos", empresaId: "1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "2", nome: "Cosméticos", cor: "#4ECDC4", descricao: "Produtos de beleza", empresaId: "1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "3", nome: "Higiene", cor: "#45B7D1", descricao: "Produtos de higiene pessoal", empresaId: "1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "4", nome: "Suplementos", cor: "#96CEB4", descricao: "Vitaminas e suplementos", empresaId: "1", createdAt: "2024-01-01T00:00:00Z" },
  { id: "5", nome: "Bebê", cor: "#FFEAA7", descricao: "Produtos para bebês", empresaId: "1", createdAt: "2024-01-01T00:00:00Z" }
];

// Mock Status Lote
export const mockStatusLote: StatusLote[] = [
  { id: "1", nome: "Ativo", cor: "#4CAF50" },
  { id: "2", nome: "Vencido", cor: "#F44336" },
  { id: "3", nome: "Próximo ao Vencimento", cor: "#FF9800" }
];

// Mock Produtos
export const mockProdutos: Produto[] = [
  {
    id: "1",
    nome: "Dipirona 500mg",
    descricao: "Analgésico e antitérmico",
    preco: 12.50,
    estoqueAtual: 150,
    estoqueMinimo: 20,
    validade: "2024-12-31",
    dataEntrada: "2024-01-15T10:00:00Z",
    codigoRastreio: "DIP001",
    categoriaId: "1",
    empresaId: "1",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    nome: "Shampoo Anticaspa",
    descricao: "Tratamento para caspa e coceira",
    preco: 25.90,
    estoqueAtual: 8,
    estoqueMinimo: 15,
    validade: "2025-06-30",
    dataEntrada: "2024-02-01T14:30:00Z",
    codigoRastreio: "SHA002",
    categoriaId: "3",
    empresaId: "1",
    createdAt: "2024-02-01T14:30:00Z",
    updatedAt: "2024-02-01T14:30:00Z"
  },
  {
    id: "3",
    nome: "Vitamina C 1000mg",
    descricao: "Suplemento vitamínico",
    preco: 35.00,
    estoqueAtual: 45,
    estoqueMinimo: 10,
    validade: "2024-08-15",
    dataEntrada: "2024-01-20T09:15:00Z",
    codigoRastreio: "VIT003",
    categoriaId: "4",
    empresaId: "1",
    createdAt: "2024-01-20T09:15:00Z",
    updatedAt: "2024-01-20T09:15:00Z"
  },
  {
    id: "4",
    nome: "Protetor Solar FPS 60",
    descricao: "Proteção solar facial",
    preco: 48.90,
    estoqueAtual: 22,
    estoqueMinimo: 5,
    validade: "2025-03-30",
    dataEntrada: "2024-01-25T16:45:00Z",
    codigoRastreio: "SOL004",
    categoriaId: "2",
    empresaId: "1",
    createdAt: "2024-01-25T16:45:00Z",
    updatedAt: "2024-01-25T16:45:00Z"
  },
  {
    id: "5",
    nome: "Fralda Descartável P",
    descricao: "Pacote com 50 unidades",
    preco: 42.50,
    estoqueAtual: 12,
    estoqueMinimo: 8,
    validade: "2026-01-15",
    dataEntrada: "2024-02-05T11:20:00Z",
    codigoRastreio: "FRA005",
    categoriaId: "5",
    empresaId: "1",
    createdAt: "2024-02-05T11:20:00Z",
    updatedAt: "2024-02-05T11:20:00Z"
  }
];

// Mock Lotes
export const mockLotes: Lote[] = [
  {
    id: "1",
    produtoId: "1",
    quantidade: 100,
    dataEntrada: "2024-01-15",
    validade: "2024-12-31",
    status: mockStatusLote[0]
  },
  {
    id: "2",
    produtoId: "3",
    quantidade: 50,
    dataEntrada: "2024-01-20",
    validade: "2024-08-15",
    status: mockStatusLote[2]
  }
];

// Mock Movimentações
export const mockMovimentacoes: Movimentacao[] = [
  {
    id: "1",
    produtoId: "1",
    tipo: "entrada",
    quantidade: 100,
    data: "2024-01-15T10:00:00Z",
    observacao: "Compra do fornecedor"
  },
  {
    id: "2",
    produtoId: "1",
    tipo: "saida",
    quantidade: 10,
    data: "2024-01-16T15:30:00Z",
    observacao: "Venda no balcão"
  }
];

// Mock Alertas
export const mockAlertas: Alerta[] = [
  {
    id: "1",
    tipo: "estoque_baixo",
    mensagem: "Shampoo Anticaspa está com estoque baixo (8 unidades)",
    produtoId: "2",
    empresaId: "1",
    lida: false,
    createdAt: "2024-02-15T08:00:00Z"
  },
  {
    id: "2",
    tipo: "vencimento_proximo",
    mensagem: "Vitamina C 1000mg vence em 30 dias",
    produtoId: "3",
    empresaId: "1",
    lida: false,
    createdAt: "2024-02-14T10:30:00Z"
  }
];

// Mock Dados Dashboard
export const mockDadosDashboard: DadosDashboard = {
  totalProdutos: 237,
  produtosComEstoqueBaixo: 12,
  produtosVencendo: 5,
  valorTotalEstoque: 125450.80
};
