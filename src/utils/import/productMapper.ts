
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, parse } from 'date-fns';
import { Produto, Categoria } from '@/types';
import { ImportedProduct } from './validation';

export const mapImportedToProducts = async (
  data: ImportedProduct[],
  empresaId: string,
  categorias: Categoria[]
): Promise<Produto[]> => {
  // Get existing products to update them instead of creating duplicates
  const { data: existingProducts, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('empresa_id', empresaId);
  
  if (error) {
    console.error('Erro ao buscar produtos existentes:', error);
    toast.error('Erro ao buscar produtos existentes');
    return [];
  }

  return data.map(row => {
    // Try to find existing product by name
    const existingProduct = existingProducts?.find(p => 
      p.nome.toLowerCase() === row.Nome.toLowerCase()
    );
    
    // Parse price from various formats
    const precoStr = row['Preço'] || row['Preço Unitário'] || '0';
    const preco = parseFloat(precoStr.replace('R$', '').replace(',', '.').trim());
    
    // Parse stock
    const estoqueStr = row.Estoque || row['Estoque Atual'] || '0';
    const estoqueAtual = parseInt(estoqueStr.trim());
    
    // Parse date
    let validade: string | undefined = undefined;
    const dataValidade = row['Data de Validade'] || row.Validade;
    if (dataValidade) {
      try {
        // Try different date formats
        const dateFormats = ['dd/MM/yyyy', 'yyyy-MM-dd'];
        
        for (const dateFormat of dateFormats) {
          try {
            const date = parse(dataValidade, dateFormat, new Date());
            validade = format(date, 'yyyy-MM-dd');
            break;
          } catch (e) {
            // Continue to next format
          }
        }
      } catch (e) {
        console.warn('Erro ao converter data:', dataValidade);
      }
    }
    
    // Find category by name
    let categoriaId: string | undefined = undefined;
    if (row.Categoria) {
      const categoria = categorias.find(c => 
        c.nome.toLowerCase() === row.Categoria?.toLowerCase()
      );
      if (categoria) {
        categoriaId = categoria.id;
      }
    }
    
    // Create new product or update existing
    const produto: Produto = {
      id: existingProduct?.id || crypto.randomUUID(),
      nome: row.Nome,
      descricao: existingProduct?.descricao || '',
      preco: preco,
      categoriaId: categoriaId || existingProduct?.categoria_id,
      empresaId,
      estoqueMinimo: 5, // Default value
      estoqueAtual,
      validade,
      dataEntrada: existingProduct?.data_entrada || new Date().toISOString(),
      codigoRastreio: existingProduct?.codigo_rastreio,
      createdAt: existingProduct?.created_at || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return produto;
  });
};
