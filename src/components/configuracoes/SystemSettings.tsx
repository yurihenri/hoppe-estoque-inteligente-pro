
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    unidadeMedida: localStorage.getItem("sys_unidadeMedida") || "un",
    moeda: localStorage.getItem("sys_moeda") || "R$",
    formatoData: localStorage.getItem("sys_formatoData") || "DD/MM/YYYY",
    exportarComCabecalhos: localStorage.getItem("sys_exportarComCabecalhos") === "true" || true,
    backupAutomatico: localStorage.getItem("sys_backupAutomatico") === "true" || false,
    frequenciaBackup: localStorage.getItem("sys_frequenciaBackup") || "semanal",
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const handleChange = (key: keyof typeof settings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    setIsUpdating(true);
    
    // Save all settings to localStorage
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(`sys_${key}`, value.toString());
    });
    
    // Simulate API save
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Configurações do sistema salvas com sucesso!");
    }, 500);
  };

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    try {
      // Fetch data to backup
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('*');
        
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('*');
        
      if (produtosError || categoriasError) {
        throw new Error('Erro ao obter dados para backup');
      }
      
      // Create backup object
      const backup = {
        timestamp: new Date().toISOString(),
        data: {
          produtos,
          categorias
        }
      };
      
      // Save backup to localStorage (in a real app, you'd store in cloud)
      const backups = JSON.parse(localStorage.getItem('backups') || '[]');
      backups.push(backup);
      localStorage.setItem('backups', JSON.stringify(backups));
      
      toast.success("Backup criado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao criar backup: ${error.message}`);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Configurações Gerais</h3>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unidade-medida">Unidade de medida padrão</Label>
              <Select 
                value={settings.unidadeMedida}
                onValueChange={(value) => handleChange("unidadeMedida", value)}
              >
                <SelectTrigger id="unidade-medida">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="un">Unidade (un)</SelectItem>
                  <SelectItem value="kg">Quilograma (kg)</SelectItem>
                  <SelectItem value="g">Grama (g)</SelectItem>
                  <SelectItem value="l">Litro (l)</SelectItem>
                  <SelectItem value="ml">Mililitro (ml)</SelectItem>
                  <SelectItem value="cx">Caixa (cx)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda padrão</Label>
              <Select 
                value={settings.moeda}
                onValueChange={(value) => handleChange("moeda", value)}
              >
                <SelectTrigger id="moeda">
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="R$">Real (R$)</SelectItem>
                  <SelectItem value="$">Dólar ($)</SelectItem>
                  <SelectItem value="€">Euro (€)</SelectItem>
                  <SelectItem value="£">Libra (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="formato-data">Formato de data</Label>
              <Select 
                value={settings.formatoData}
                onValueChange={(value) => handleChange("formatoData", value)}
              >
                <SelectTrigger id="formato-data">
                  <SelectValue placeholder="Formato de data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Exportação de Dados</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="exportar-cabecalhos">Incluir cabeçalhos ao exportar</Label>
                <p className="text-sm text-muted-foreground">
                  Exportar CSV/Excel com nomes de colunas
                </p>
              </div>
              <Switch 
                id="exportar-cabecalhos"
                checked={settings.exportarComCabecalhos}
                onCheckedChange={(checked) => handleChange("exportarComCabecalhos", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Backup do Sistema</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="backup-automatico">Backup automático</Label>
                <p className="text-sm text-muted-foreground">
                  Realizar backup automático dos dados
                </p>
              </div>
              <Switch 
                id="backup-automatico"
                checked={settings.backupAutomatico}
                onCheckedChange={(checked) => handleChange("backupAutomatico", checked)}
              />
            </div>
            
            {settings.backupAutomatico && (
              <div className="space-y-2">
                <Label htmlFor="frequencia-backup">Frequência de backup</Label>
                <Select 
                  value={settings.frequenciaBackup}
                  onValueChange={(value) => handleChange("frequenciaBackup", value)}
                >
                  <SelectTrigger id="frequencia-backup">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                onClick={createManualBackup}
                disabled={isCreatingBackup}
              >
                {isCreatingBackup ? "Criando backup..." : "Criar backup manual"}
              </Button>
            </div>
          </div>
          
          <Button 
            onClick={saveSettings} 
            className="mt-6" 
            disabled={isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
