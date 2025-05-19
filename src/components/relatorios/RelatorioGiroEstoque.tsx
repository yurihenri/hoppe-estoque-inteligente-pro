
import React, { useMemo } from 'react';
import { Produto } from '@/types';
import { 
  calcularClassificacaoABC, 
  obterProdutosGiroLento, 
  obterDadosClassificacao 
} from '@/utils/estoqueUtils';
import ClassificacaoABCGrafico from './estoque/ClassificacaoABCGrafico';
import ProdutosGiroLento from './estoque/ProdutosGiroLento';
import ClassificacaoABCTabela from './estoque/ClassificacaoABCTabela';

interface RelatorioGiroEstoqueProps {
  produtos: Produto[];
}

const RelatorioGiroEstoque: React.FC<RelatorioGiroEstoqueProps> = ({ produtos }) => {
  // Calculate ABC classification
  const produtosClassificados = useMemo(() => calcularClassificacaoABC(produtos), [produtos]);
  
  // Get products with slow turnover
  const produtosGiroLento = useMemo(() => obterProdutosGiroLento(produtos), [produtos]);
  
  // Get classification data for chart
  const dadosClassificacao = useMemo(() => 
    obterDadosClassificacao(produtosClassificados), [produtosClassificados]);
  
  return (
    <>
      {/* ABC Classification Analysis */}
      <ClassificacaoABCGrafico dadosClassificacao={dadosClassificacao} />
      
      {/* Products with slow turnover */}
      <ProdutosGiroLento produtos={produtosGiroLento} />
      
      {/* Detailed product classification */}
      <ClassificacaoABCTabela produtos={produtosClassificados} />
    </>
  );
};

export default RelatorioGiroEstoque;
