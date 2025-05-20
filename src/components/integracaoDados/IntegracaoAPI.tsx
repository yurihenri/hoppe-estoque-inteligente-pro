
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { Database, CheckCircle } from 'lucide-react';

const IntegracaoAPI = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [syncInterval, setSyncInterval] = useState('24');
  const [isTesting, setIsTesting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleTestConnection = () => {
    if (!apiUrl) {
      toast.error('Por favor, insira a URL da API.');
      return;
    }

    if (!apiKey) {
      toast.error('Por favor, insira a chave de autenticação.');
      return;
    }

    setIsTesting(true);

    // Simular teste de conexão
    setTimeout(() => {
      setIsTesting(false);
      setConnected(true);
      toast.success('Conexão com API testada com sucesso!');
    }, 2000);
  };

  const handleActivateIntegration = () => {
    if (!connected) {
      toast.error('Por favor, teste a conexão antes de ativar a integração.');
      return;
    }

    setIsActivating(true);

    // Simular ativação
    setTimeout(() => {
      // Salvar configuração no localStorage
      const config = {
        apiUrl,
        syncInterval: Number(syncInterval),
        lastSync: null,
        active: true
      };
      
      localStorage.setItem('apiIntegracao', JSON.stringify(config));
      
      // Adicionar ao histórico
      const historico = JSON.parse(localStorage.getItem('importacoes') || '[]');
      const novaIntegracao = {
        id: `api-${Date.now()}`,
        data: new Date().toISOString(),
        metodo: 'API',
        quantidade: Math.floor(Math.random() * 50) + 5, // Aleatório para simulação
        status: 'Sucesso',
        origem: apiUrl
      };
      
      historico.unshift(novaIntegracao);
      localStorage.setItem('importacoes', JSON.stringify(historico.slice(0, 20)));
      
      setIsActivating(false);
      toast.success('Integração API ativada com sucesso!');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">URL da API</Label>
              <Input
                id="apiUrl"
                placeholder="https://api.exemplo.com/produtos"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">Chave de Autenticação (API Key / Token)</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Sua chave de API ou token"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="syncInterval">Intervalo de Sincronização</Label>
              <Select value={syncInterval} onValueChange={setSyncInterval}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um intervalo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">A cada 6 horas</SelectItem>
                  <SelectItem value="12">A cada 12 horas</SelectItem>
                  <SelectItem value="24">A cada 24 horas</SelectItem>
                  <SelectItem value="168">Semanalmente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 pt-2">
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTesting || !apiUrl || !apiKey}
              >
                {isTesting ? 'Testando...' : 'Testar Conexão'}
              </Button>
              
              <Button 
                onClick={handleActivateIntegration}
                disabled={isActivating || !connected}
                className={connected ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {connected && <CheckCircle className="mr-2 h-4 w-4" />}
                {isActivating ? 'Ativando...' : 'Ativar Integração'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold text-lg mb-4">Guia de Configuração API</h3>
          <div className="space-y-2 text-sm">
            <p>Para integrar com o Estoque Inteligente, sua API precisa:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Retornar um JSON com array de produtos</li>
              <li>Incluir campos: nome, codigo, quantidade, validade, categoria</li>
              <li>Suportar autenticação via API Key ou Bearer Token</li>
              <li>Limitar resposta a 1000 itens por chamada</li>
            </ul>
            
            <div className="bg-muted p-3 rounded-md mt-4">
              <p className="font-medium mb-2">Exemplo de resposta esperada:</p>
              <pre className="text-xs overflow-auto p-2">
                {JSON.stringify({
                  produtos: [
                    {
                      nome: "Produto Exemplo",
                      codigo: "7891234567890",
                      quantidade: 50,
                      validade: "2023-12-31",
                      categoria: "Geral"
                    }
                  ]
                }, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegracaoAPI;
