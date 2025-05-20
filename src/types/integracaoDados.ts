
export interface ImportacaoHistorico {
  id: string;
  data: string;
  metodo: 'upload' | 'API';
  quantidade: number;
  status: 'Sucesso' | 'Erro';
  arquivo?: string;
  origem?: string;
}

export interface ApiConfig {
  apiUrl: string;
  syncInterval: number;
  lastSync: string | null;
  active: boolean;
}

export interface ColumnMapping {
  field: 'nome' | 'codigoBarras' | 'quantidade' | 'validade' | 'categoria';
  columnName: string;
}
