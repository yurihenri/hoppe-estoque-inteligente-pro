
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Produto } from '@/types';

export const importProdutos = async (produtos: Produto[]): Promise<boolean> => {
  const { error } = await supabase
    .from('produtos')
    .upsert(
      produtos.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: p.preco,
        categoria_id: p.categoriaId,
        empresa_id: p.empresaId,
        quantidade: p.estoqueAtual,
        validade: p.validade,
        data_entrada: p.dataEntrada,
        codigo_rastreio: p.codigoRastreio
      })),
      { onConflict: 'id' }
    );
  
  if (error) {
    console.error('Erro ao importar produtos:', error);
    toast.error('Erro ao importar produtos: ' + error.message);
    return false;
  }
  
  toast.success(`${produtos.length} produtos importados com sucesso`);
  return true;
};
