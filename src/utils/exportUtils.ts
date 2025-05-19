
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Produto } from '@/types';
import { toast } from 'sonner';

export const exportarCSVVencimentos = (produtos: Produto[]) => {
  try {
    const dados = produtos
      .filter(p => p.validade)
      .map(p => ({
        Nome: p.nome,
        Categoria: p.categoria?.nome || 'Sem categoria',
        'Data de Validade': p.validade ? format(new Date(p.validade), 'dd/MM/yyyy', {locale: pt}) : 'N/A',
        'Dias até Vencer': p.validade ? 
          Math.ceil((new Date(p.validade).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 'N/A',
        'Estoque Atual': p.estoqueAtual,
        'Valor Total': (p.preco * p.estoqueAtual).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
      }));
    
    return createAndDownloadCSV(dados, 'relatorio-vencimentos');
  } catch (error) {
    console.error('Erro ao exportar relatório de vencimentos:', error);
    return false;
  }
};

export const exportarCSVEstoque = (produtos: Produto[]) => {
  try {
    const dados = produtos.map(p => ({
      Nome: p.nome,
      Categoria: p.categoria?.nome || 'Sem categoria',
      'Estoque Atual': p.estoqueAtual,
      'Data de Entrada': format(new Date(p.dataEntrada), 'dd/MM/yyyy', {locale: pt}),
      'Dias em Estoque': Math.ceil((new Date().getTime() - new Date(p.dataEntrada).getTime()) / (1000 * 3600 * 24))
    }));
    
    return createAndDownloadCSV(dados, 'relatorio-giro-estoque');
  } catch (error) {
    console.error('Erro ao exportar relatório de estoque:', error);
    return false;
  }
};

export const exportarCSVFinanceiro = (produtos: Produto[]) => {
  try {
    const dados = produtos.map(p => ({
      Nome: p.nome,
      Categoria: p.categoria?.nome || 'Sem categoria',
      'Preço Unitário': p.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}),
      'Estoque': p.estoqueAtual,
      'Valor Total': (p.preco * p.estoqueAtual).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})
    }));
    
    return createAndDownloadCSV(dados, 'relatorio-financeiro');
  } catch (error) {
    console.error('Erro ao exportar relatório financeiro:', error);
    return false;
  }
};

const createAndDownloadCSV = (dados: any[], nomeArquivo: string) => {
  if (dados.length === 0) {
    toast.warning('Não há dados disponíveis para exportar');
    return false;
  }
  
  // Cabeçalhos
  const headers = Object.keys(dados[0]);
  let csvContent = headers.join(',') + '\n';
  
  // Linhas de dados
  dados.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      // Garantir que strings com vírgulas sejam envolvidas em aspas
      return typeof value === 'string' && value.includes(',') 
        ? `"${value}"` 
        : value;
    }).join(',');
    csvContent += row + '\n';
  });
  
  // Criar e baixar o arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${nomeArquivo}-${format(new Date(), 'dd-MM-yyyy')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success(`Relatório exportado com sucesso`);
  return true;
};
