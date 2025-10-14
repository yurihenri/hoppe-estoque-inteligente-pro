
import { parse } from 'date-fns';

export interface ImportedProduct {
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
  
  // Security limits
  const MAX_NAME_LENGTH = 255;
  const MAX_CATEGORY_LENGTH = 100;
  const MAX_PRICE = 999999999;
  const MAX_QUANTITY = 1000000;
  
  if (data.length === 0) {
    errors.push('O arquivo não contém dados');
    return { valid: false, errors };
  }
  
  if (data.length > 10000) {
    errors.push('Arquivo muito grande. Máximo de 10.000 produtos por importação');
    return { valid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    // Nome validation with length limit
    if (!row.Nome) {
      errors.push(`Linha ${index + 1}: Nome do produto é obrigatório`);
    } else if (row.Nome.length > MAX_NAME_LENGTH) {
      errors.push(`Linha ${index + 1}: Nome muito longo (máximo ${MAX_NAME_LENGTH} caracteres)`);
    }
    
    // Categoria validation with length limit
    const categoria = row.Categoria;
    if (categoria && categoria.length > MAX_CATEGORY_LENGTH) {
      errors.push(`Linha ${index + 1}: Nome da categoria muito longo (máximo ${MAX_CATEGORY_LENGTH} caracteres)`);
    }
    
    // Preço validation with bounds
    const preco = row['Preço'] || row['Preço Unitário'];
    if (!preco) {
      errors.push(`Linha ${index + 1}: Preço é obrigatório`);
    } else {
      const precoNum = parseFloat(preco.replace(',', '.').replace('R$', '').trim());
      if (isNaN(precoNum)) {
        errors.push(`Linha ${index + 1}: Preço deve ser um número válido`);
      } else if (precoNum < 0) {
        errors.push(`Linha ${index + 1}: Preço não pode ser negativo`);
      } else if (precoNum > MAX_PRICE) {
        errors.push(`Linha ${index + 1}: Preço muito alto (máximo ${MAX_PRICE})`);
      }
    }
    
    // Estoque validation with bounds
    const estoque = row.Estoque || row['Estoque Atual'];
    if (!estoque) {
      errors.push(`Linha ${index + 1}: Estoque é obrigatório`);
    } else {
      const estoqueNum = parseInt(estoque.trim());
      if (isNaN(estoqueNum)) {
        errors.push(`Linha ${index + 1}: Estoque deve ser um número válido`);
      } else if (estoqueNum < 0) {
        errors.push(`Linha ${index + 1}: Estoque não pode ser negativo`);
      } else if (estoqueNum > MAX_QUANTITY) {
        errors.push(`Linha ${index + 1}: Quantidade muito alta (máximo ${MAX_QUANTITY})`);
      }
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
