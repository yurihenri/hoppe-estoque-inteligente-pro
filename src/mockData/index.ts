import { Alerta, Categoria, DadosDashboard, Empresa, Lote, Movimentacao, Produto, StatusLote, Usuario } from "../types";

// Dados da empresa atual
export const empresaAtual: Empresa = {
  id: "1",
  nome: "Supermercado Modelo",
  cnpj: "12.345.678/0001-90",
  logo: "/logo.svg",
  segmento: "Supermercado",
  endereco: "Av. Principal, 1000 - São Paulo/SP"
};

// Usuário logado
export const usuarioLogado: Usuario = {
  id: "1",
  nome: "João Silva",
  email: "joao@modelo.com",
  cargo: "Gerente de Estoque",
  avatarUrl: "/avatar.png",
  empresaId: "1",
  createdAt: new Date().toISOString()
};

// Categorias
export const categorias: Categoria[] = [
  { id: "1", nome: "Laticínios", cor: "#10B981", descricao: "Produtos derivados do leite", empresaId: "1" },
  { id: "2", nome: "Padaria", cor: "#F59E0B", descricao: "Produtos de panificação", empresaId: "1" },
  { id: "3", nome: "Hortifruti", cor: "#0EA5E9", descricao: "Frutas, legumes e verduras", empresaId: "1" },
  { id: "4", nome: "Carnes", cor: "#EF4444", descricao: "Carnes e derivados", empresaId: "1" },
  { id: "5", nome: "Bebidas", cor: "#8B5CF6", descricao: "Bebidas em geral", empresaId: "1" }
];

// Função para criar data no passado (dias)
const diasAtras = (dias: number): Date => {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data;
};

// Função para criar data no futuro (dias)
const diasFuturos = (dias: number): Date => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data;
};

// Produtos
export const produtos: Produto[] = [
  { 
    id: "1", 
    nome: "Leite Integral", 
    descricao: "Leite integral 1L", 
    codigoBarras: "7891234567890", 
    preco: 4.99, 
    imagem: "/leite.jpg", 
    categoriaId: "1", 
    empresaId: "1", 
    unidade: "L", 
    estoqueMinimo: 20, 
    estoqueAtual: 45,
    dataEntrada: new Date().toISOString()
  },
  { 
    id: "2", 
    nome: "Pão Francês", 
    descricao: "Pão francês tradicional", 
    codigoBarras: "7891234567891", 
    preco: 0.75, 
    categoriaId: "2", 
    empresaId: "1", 
    unidade: "Un", 
    estoqueMinimo: 50, 
    estoqueAtual: 120,
    dataEntrada: new Date().toISOString()
  },
  { 
    id: "3", 
    nome: "Maçã Fuji", 
    descricao: "Maçã fuji fresca", 
    codigoBarras: "7891234567892", 
    preco: 8.99, 
    imagem: "/maca.jpg", 
    categoriaId: "3", 
    empresaId: "1", 
    unidade: "Kg", 
    estoqueMinimo: 15, 
    estoqueAtual: 8,
    dataEntrada: new Date().toISOString()
  },
  { 
    id: "4", 
    nome: "Filé Mignon", 
    descricao: "Filé mignon bovino", 
    codigoBarras: "7891234567893", 
    preco: 89.90, 
    categoriaId: "4", 
    empresaId: "1", 
    unidade: "Kg", 
    estoqueMinimo: 10, 
    estoqueAtual: 15,
    dataEntrada: new Date().toISOString()
  },
  { 
    id: "5", 
    nome: "Água Mineral", 
    descricao: "Água mineral sem gás 500ml", 
    codigoBarras: "7891234567894", 
    preco: 2.50, 
    imagem: "/agua.jpg", 
    categoriaId: "5", 
    empresaId: "1", 
    unidade: "Un", 
    estoqueMinimo: 30, 
    estoqueAtual: 78,
    dataEntrada: new Date().toISOString()
  }
];

// Função para determinar o status do lote
const determinarStatusLote = (dataValidade: Date): StatusLote => {
  const hoje = new Date();
  const diferencaDias = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diferencaDias < 0) return 'vencido';
  if (diferencaDias <= 7) return 'proxVencimento';
  return 'normal';
};

// Lotes
export const lotes: Lote[] = [
  { 
    id: "1", 
    produtoId: "1", 
    quantidade: 20, 
    dataFabricacao: diasAtras(15), 
    dataValidade: diasFuturos(15), 
    numeroLote: "LT2023001", 
    localArmazenamento: "Prateleira A1", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(15))
  },
  { 
    id: "2", 
    produtoId: "1", 
    quantidade: 25, 
    dataFabricacao: diasAtras(10), 
    dataValidade: diasFuturos(20), 
    numeroLote: "LT2023002", 
    localArmazenamento: "Prateleira A2", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(20))
  },
  { 
    id: "3", 
    produtoId: "2", 
    quantidade: 120, 
    dataFabricacao: diasAtras(1), 
    dataValidade: diasFuturos(2), 
    numeroLote: "LT2023003", 
    localArmazenamento: "Vitrine", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(2))
  },
  { 
    id: "4", 
    produtoId: "3", 
    quantidade: 8, 
    dataFabricacao: diasAtras(5), 
    dataValidade: diasFuturos(5), 
    numeroLote: "LT2023004", 
    localArmazenamento: "Bancada B3", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(5))
  },
  { 
    id: "5", 
    produtoId: "4", 
    quantidade: 15, 
    dataFabricacao: diasAtras(3), 
    dataValidade: diasFuturos(10), 
    numeroLote: "LT2023005", 
    localArmazenamento: "Refrigerador 2", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(10))
  },
  { 
    id: "6", 
    produtoId: "5", 
    quantidade: 50, 
    dataFabricacao: diasAtras(60), 
    dataValidade: diasFuturos(305), 
    numeroLote: "LT2023006", 
    localArmazenamento: "Estante E1", 
    empresaId: "1", 
    status: determinarStatusLote(diasFuturos(305))
  },
  { 
    id: "7", 
    produtoId: "1", 
    quantidade: 10, 
    dataFabricacao: diasAtras(20), 
    dataValidade: diasAtras(5), 
    numeroLote: "LT2023007", 
    localArmazenamento: "Prateleira A1", 
    empresaId: "1", 
    status: determinarStatusLote(diasAtras(5))
  }
];

// Alertas
export const alertas: Alerta[] = [
  { 
    id: "1", 
    tipo: "vencimento", 
    produtoId: "1", 
    loteId: "7", 
    mensagem: "Lote LT2023007 de Leite Integral VENCIDO! É necessário realizar o descarte.", 
    data: diasAtras(5), 
    lido: false, 
    empresaId: "1" 
  },
  { 
    id: "2", 
    tipo: "vencimento", 
    produtoId: "2", 
    loteId: "3", 
    mensagem: "Lote LT2023003 de Pão Francês vence em 2 dias. Considere uma promoção.", 
    data: new Date(), 
    lido: false, 
    empresaId: "1" 
  },
  { 
    id: "3", 
    tipo: "vencimento", 
    produtoId: "3", 
    loteId: "4", 
    mensagem: "Lote LT2023004 de Maçã Fuji vence em 5 dias. Realize verificação.", 
    data: new Date(), 
    lido: true, 
    empresaId: "1" 
  },
  { 
    id: "4", 
    tipo: "estoqueBaixo", 
    produtoId: "3", 
    mensagem: "Estoque de Maçã Fuji abaixo do mínimo. Atual: 8, Mínimo: 15", 
    data: diasAtras(1), 
    lido: false, 
    empresaId: "1" 
  }
];

// Movimentações
export const movimentacoes: Movimentacao[] = [
  { 
    id: "1", 
    tipo: "entrada", 
    produtoId: "1", 
    loteId: "1", 
    quantidade: 20, 
    data: diasAtras(15), 
    responsavelId: "1", 
    motivo: "Compra de fornecedor", 
    empresaId: "1" 
  },
  { 
    id: "2", 
    tipo: "entrada", 
    produtoId: "1", 
    loteId: "2", 
    quantidade: 25, 
    data: diasAtras(10), 
    responsavelId: "1", 
    motivo: "Compra de fornecedor", 
    empresaId: "1" 
  },
  { 
    id: "3", 
    tipo: "saida", 
    produtoId: "1", 
    loteId: "7", 
    quantidade: 10, 
    data: diasAtras(5), 
    responsavelId: "1", 
    motivo: "Vencimento", 
    empresaId: "1" 
  },
  { 
    id: "4", 
    tipo: "entrada", 
    produtoId: "3", 
    loteId: "4", 
    quantidade: 15, 
    data: diasAtras(5), 
    responsavelId: "1", 
    motivo: "Compra de fornecedor", 
    empresaId: "1" 
  },
  { 
    id: "5", 
    tipo: "saida", 
    produtoId: "3", 
    quantidade: 7, 
    data: diasAtras(2), 
    responsavelId: "1", 
    motivo: "Vendas", 
    empresaId: "1" 
  }
];

// Dados para o Dashboard
export const dadosDashboard: DadosDashboard = {
  totalProdutos: produtos.length,
  produtosVencidos: lotes.filter(lote => lote.status === 'vencido').length,
  produtosAVencer: lotes.filter(lote => lote.status === 'proxVencimento').length,
  distribuicaoCategorias: categorias.map(cat => ({
    categoria: cat.nome,
    quantidade: produtos.filter(p => p.categoriaId === cat.id).length
  })),
  distribuicaoValidade: [
    { status: "Normal", quantidade: lotes.filter(lote => lote.status === 'normal').length },
    { status: "Próximo ao Vencimento", quantidade: lotes.filter(lote => lote.status === 'proxVencimento').length },
    { status: "Vencido", quantidade: lotes.filter(lote => lote.status === 'vencido').length }
  ],
  alertas: alertas
};

// Função para obter a categoria pelo ID
export const getCategoriaById = (id: string): Categoria | undefined => {
  return categorias.find(cat => cat.id === id);
};

// Função para obter o produto pelo ID
export const getProdutoById = (id: string): Produto | undefined => {
  return produtos.find(p => p.id === id);
};

// Função para filtrar lotes pelo produto ID
export const getLotesByProdutoId = (produtoId: string): Lote[] => {
  return lotes.filter(lote => lote.produtoId === produtoId);
};
