
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
