
import Papa from 'papaparse';
import { toast } from 'sonner';
import { Produto, Categoria } from '@/types';
import { normalizeProduto } from './normalizeData';
import { supabase } from '@/integrations/supabase/client';
import { format, parse } from 'date-fns';
import { pt } from 'date-fns/locale';

interface ImportedProduct {
  Nome: string;
  Categoria?: string;
  'Preço'?: string;
  'Preço Unitário'?: string;
  Estoque?: string;
  'Estoque Atual'?: string;
  'Data de Validade'?: string;
  Validade?: string;
  [key: string]: string | undefined;
}

export const validateImportedProducts = (
  data: ImportedProduct[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (data.length === 0) {
    errors.push('O arquivo não contém dados');
    return { valid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    if (!row.Nome) {
      errors.push(`Linha ${index + 1}: Nome do produto é obrigatório`);
    }
    
    const preco = row['Preço'] || row['Preço Unitário'];
    if (!preco) {
      errors.push(`Linha ${index + 1}: Preço é obrigatório`);
    } else if (isNaN(parseFloat(preco.replace(',', '.').replace('R$', '').trim()))) {
      errors.push(`Linha ${index + 1}: Preço deve ser um número válido`);
    }
    
    const estoque = row.Estoque || row['Estoque Atual'];
    if (!estoque) {
      errors.push(`Linha ${index + 1}: Estoque é obrigatório`);
    } else if (isNaN(parseInt(estoque.trim()))) {
      errors.push(`Linha ${index + 1}: Estoque deve ser um número válido`);
    }
    
    const dataValidade = row['Data de Validade'] || row.Validade;
    if (dataValidade) {
      try {
        // Try different date formats
        const dateFormats = ['dd/MM/yyyy', 'yyyy-MM-dd'];
        let valid = false;
        
        for (const format of dateFormats) {
          try {
            parse(dataValidade, format, new Date());
            valid = true;
            break;
          } catch (e) {
            // Continue to next format
          }
        }
        
        if (!valid) {
          errors.push(`Linha ${index + 1}: Data de validade inválida. Formatos aceitos: DD/MM/AAAA, AAAA-MM-DD`);
        }
      } catch (e) {
        errors.push(`Linha ${index + 1}: Data de validade inválida. Formatos aceitos: DD/MM/AAAA, AAAA-MM-DD`);
      }
    }
  });
  
  return { valid: errors.length === 0, errors };
};

export const parseCSV = (file: File): Promise<ImportedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as ImportedProduct[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

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

const processRow = (row: any, categorias: Categoria[]): Produto | null => {
  try {
    // Validações básicas
    if (!row.nome || !row.preco || !row.quantidade) {
      return null;
    }

    // Buscar categoria por nome
    let categoriaId: string | undefined;
    if (row.categoria) {
      const categoria = categorias.find(c => 
        c.nome.toLowerCase() === row.categoria.toLowerCase()
      );
      categoriaId = categoria?.id;
    }

    return {
      id: crypto.randomUUID(),
      nome: row.nome,
      descricao: row.descricao || undefined,
      preco: parseFloat(row.preco),
      estoqueAtual: parseInt(row.quantidade),
      estoqueMinimo: parseInt(row.estoque_minimo) || 0,
      validade: row.validade ? new Date(row.validade).toISOString().split('T')[0] : undefined,
      dataEntrada: row.data_entrada ? new Date(row.data_entrada).toISOString() : new Date().toISOString(),
      codigoRastreio: row.codigo_rastreio || undefined,
      categoriaId,
      empresaId: '', // Will be set by the calling function
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao processar linha:', error);
    return null;
  }
};

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
