
import { Produto } from '@/types';
import { differenceInDays } from 'date-fns';

/**
 * Calculate the ABC classification for products
 */
export const calcularClassificacaoABC = (produtos: Produto[]) => {
  // Sort products by value (stock * price) in descending order
  const produtosOrdenados = [...produtos]
    .filter(p => p.estoqueAtual > 0 && p.preco > 0)
    .sort((a, b) => (b.preco * b.estoqueAtual) - (a.preco * a.estoqueAtual));
  
  const totalValor = produtosOrdenados.reduce((acc, p) => acc + (p.preco * p.estoqueAtual), 0);
  let valorAcumulado = 0;
  
  return produtosOrdenados.map(produto => {
    const valorProduto = produto.preco * produto.estoqueAtual;
    valorAcumulado += valorProduto;
    const percentualAcumulado = (valorAcumulado / totalValor) * 100;
    
    // ABC classification based on accumulated percentage
    let classificacao = '';
    if (percentualAcumulado <= 70) {
      classificacao = 'A';
    } else if (percentualAcumulado <= 90) {
      classificacao = 'B';
    } else {
      classificacao = 'C';
    }
    
    return {
      ...produto,
      classificacaoABC: classificacao,
      valorEstoque: valorProduto,
      percentualAcumulado
    };
  });
};

/**
 * Calculate days in stock for products
 */
export const calcularDiasEmEstoque = (produtos: Produto[]) => {
  return produtos.map(produto => {
    const diasEmEstoque = differenceInDays(new Date(), new Date(produto.dataEntrada));
    return {
      ...produto,
      diasEmEstoque
    };
  });
};

/**
 * Get products with slow turnover (more than 60 days in stock)
 */
export const obterProdutosGiroLento = (produtos: Produto[]) => {
  const produtosComTempoEstoque = calcularDiasEmEstoque(produtos);
  
  return produtosComTempoEstoque
    .filter(p => p.diasEmEstoque > 60 && p.estoqueAtual > 0)
    .sort((a, b) => b.diasEmEstoque - a.diasEmEstoque);
};

/**
 * Get classification statistics for chart display
 */
export const obterDadosClassificacao = (produtosClassificados: ReturnType<typeof calcularClassificacaoABC>) => {
  return [
    {
      nome: 'Classe A',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'A').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'A')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    },
    {
      nome: 'Classe B',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'B').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'B')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    },
    {
      nome: 'Classe C',
      quantidade: produtosClassificados.filter(p => p.classificacaoABC === 'C').length,
      valor: produtosClassificados
        .filter(p => p.classificacaoABC === 'C')
        .reduce((acc, p) => acc + p.valorEstoque, 0)
    }
  ];
};
