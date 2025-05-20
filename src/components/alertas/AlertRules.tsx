
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';
import { PlusCircle, Trash2, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertRule } from '@/types/alertas';

export const getRules = (): AlertRule[] => {
  const savedRules = localStorage.getItem('alertRules');
  return savedRules ? JSON.parse(savedRules) : [];
};

const AlertRules = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [newRule, setNewRule] = useState<AlertRule>({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name: "",
    type: "quantidade",
    threshold: 10,
    category: "",
    channel: "in-app",
    frequency: "imediato",
    active: true
  });

  // Carregar regras salvas ao iniciar
  useEffect(() => {
    setRules(getRules());
  }, []);

  // Salvar regras no localStorage quando atualizadas
  useEffect(() => {
    localStorage.setItem('alertRules', JSON.stringify(rules));
  }, [rules]);

  // Resetar formulário
  const resetForm = () => {
    setNewRule({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: "",
      type: "quantidade",
      threshold: 10,
      category: "",
      channel: "in-app",
      frequency: "imediato",
      active: true
    });
  };

  // Adicionar nova regra
  const handleAddRule = () => {
    if (!newRule.name) {
      toast.error("Por favor, defina um nome para a regra");
      return;
    }
    
    setRules([...rules, newRule]);
    resetForm();
    toast.success("Regra de alerta criada com sucesso");
  };

  // Remover uma regra
  const handleRemoveRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
    toast.info("Regra removida");
  };

  // Toggle ativo/inativo
  const toggleRuleActive = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { ...rule, active: !rule.active } 
        : rule
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Regras de Alertas</h2>
          <p className="text-sm text-muted-foreground">Configure condições para receber alertas automáticos</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Regra de Alerta</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Regra</Label>
                <Input 
                  id="name" 
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  placeholder="Ex: Estoque Baixo de Medicamentos" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Alerta</Label>
                  <Select 
                    value={newRule.type} 
                    onValueChange={(value: "quantidade" | "validade") => 
                      setNewRule({...newRule, type: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quantidade">Quantidade Mínima</SelectItem>
                      <SelectItem value="validade">Validade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="threshold">
                    {newRule.type === "quantidade" 
                      ? "Quantidade Mínima" 
                      : "Dias até Vencimento"}
                  </Label>
                  <Input 
                    id="threshold"
                    type="number" 
                    min={1}
                    value={newRule.threshold}
                    onChange={(e) => setNewRule({...newRule, threshold: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria (opcional)</Label>
                <Input 
                  id="category"
                  value={newRule.category}
                  onChange={(e) => setNewRule({...newRule, category: e.target.value})}
                  placeholder="Deixe em branco para todas as categorias" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal de Notificação</Label>
                  <Select 
                    value={newRule.channel} 
                    onValueChange={(value: "email" | "push" | "in-app") => 
                      setNewRule({...newRule, channel: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="in-app">No Aplicativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Select 
                    value={newRule.frequency} 
                    onValueChange={(value: "imediato" | "diario" | "semanal") => 
                      setNewRule({...newRule, frequency: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="imediato">Imediato</SelectItem>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Limpar</Button>
              <Button onClick={handleAddRule}>Criar Regra</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Nenhuma regra configurada</h3>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Configure regras para receber alertas automáticos sobre seu estoque
            </p>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar primeira regra
              </Button>
            </DialogTrigger>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id} className={!rule.active ? "opacity-70" : undefined}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${rule.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div>
                      <h3 className="font-medium">{rule.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {rule.type === "quantidade" 
                          ? `Alerta quando quantidade < ${rule.threshold}`
                          : `Alerta quando faltarem ${rule.threshold} dias para vencer`}
                        {rule.category && ` • Categoria: ${rule.category}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={rule.active} 
                      onCheckedChange={() => toggleRuleActive(rule.id)} 
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-3" />
                
                <div className="flex justify-between text-sm">
                  <span>
                    Notificação: <span className="font-medium">
                      {rule.channel === "email" ? "Email" : 
                       rule.channel === "push" ? "Push" : "No App"}
                    </span>
                  </span>
                  <span>
                    Frequência: <span className="font-medium">
                      {rule.frequency === "imediato" ? "Imediata" : 
                       rule.frequency === "diario" ? "Diária" : "Semanal"}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertRules;
