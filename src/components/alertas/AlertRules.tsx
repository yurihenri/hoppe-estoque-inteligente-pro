
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, Package, Plus, Edit, Trash } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Define types for alert rules
type AlertType = 'quantidade' | 'validade';
type NotificationChannel = 'email' | 'push' | 'in-app';
type AlertFrequency = 'imediato' | 'diario' | 'semanal';

interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  threshold: number;
  category?: string;
  channel: NotificationChannel;
  frequency: AlertFrequency;
  active: boolean;
  createdAt: string;
}

const AlertRuleSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  type: z.enum(['quantidade', 'validade']),
  threshold: z.number().min(1),
  category: z.string().optional(),
  channel: z.enum(['email', 'push', 'in-app']),
  frequency: z.enum(['imediato', 'diario', 'semanal']),
  active: z.boolean().default(true),
});

const AlertRules: React.FC = () => {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const form = useForm<z.infer<typeof AlertRuleSchema>>({
    resolver: zodResolver(AlertRuleSchema),
    defaultValues: {
      name: '',
      type: 'quantidade',
      threshold: 10,
      category: '',
      channel: 'in-app',
      frequency: 'imediato',
      active: true,
    },
  });

  // Load saved rules from localStorage
  useEffect(() => {
    const savedRules = localStorage.getItem('alertRules');
    if (savedRules) {
      try {
        setRules(JSON.parse(savedRules));
      } catch (error) {
        console.error('Error parsing saved rules:', error);
      }
    }
  }, []);

  // Save rules to localStorage whenever they change
  useEffect(() => {
    if (rules.length > 0) {
      localStorage.setItem('alertRules', JSON.stringify(rules));
    }
  }, [rules]);

  const openNewRuleDialog = () => {
    form.reset({
      name: '',
      type: 'quantidade',
      threshold: 10,
      category: '',
      channel: 'in-app',
      frequency: 'imediato',
      active: true,
    });
    setEditingRule(null);
    setDialogOpen(true);
  };

  const openEditRuleDialog = (rule: AlertRule) => {
    form.reset({
      name: rule.name,
      type: rule.type,
      threshold: rule.threshold,
      category: rule.category || '',
      channel: rule.channel,
      frequency: rule.frequency,
      active: rule.active,
    });
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const deleteRule = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta regra?')) {
      setRules(prevRules => prevRules.filter(rule => rule.id !== id));
      toast.success('Regra excluída com sucesso');
    }
  };

  const toggleRuleActive = (id: string, active: boolean) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === id ? { ...rule, active } : rule
      )
    );
    toast.success(`Regra ${active ? 'ativada' : 'desativada'} com sucesso`);
  };

  const onSubmit = (data: z.infer<typeof AlertRuleSchema>) => {
    if (editingRule) {
      // Update existing rule
      setRules(prevRules => 
        prevRules.map(rule => 
          rule.id === editingRule.id ? { ...rule, ...data } : rule
        )
      );
      toast.success('Regra atualizada com sucesso');
    } else {
      // Create new rule
      const newRule: AlertRule = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setRules(prevRules => [...prevRules, newRule]);
      toast.success('Nova regra criada com sucesso');
    }
    setDialogOpen(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gerenciamento de Regras</h3>
        <Button onClick={openNewRuleDialog} className="flex items-center gap-2">
          <Plus size={16} />
          Nova Regra
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">Nenhuma regra configurada. Crie uma nova regra para começar.</p>
              <Button onClick={openNewRuleDialog} variant="outline" className="flex mx-auto items-center gap-2">
                <Plus size={16} />
                Criar Primeira Regra
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Notificação</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        {rule.type === 'quantidade' ? (
                          <Package size={16} className="text-hoppe-500" />
                        ) : (
                          <AlertTriangle size={16} className="text-alerta-500" />
                        )}
                        {rule.type === 'quantidade' ? 'Estoque' : 'Validade'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {rule.type === 'quantidade' 
                        ? `Menos de ${rule.threshold} unidades` 
                        : `${rule.threshold} dias para vencer`}
                    </TableCell>
                    <TableCell>{
                      {
                        'email': 'E-mail',
                        'push': 'Push',
                        'in-app': 'No aplicativo'
                      }[rule.channel]
                    }</TableCell>
                    <TableCell>{
                      {
                        'imediato': 'Imediato',
                        'diario': 'Diário',
                        'semanal': 'Semanal'
                      }[rule.frequency]
                    }</TableCell>
                    <TableCell>
                      <Switch 
                        checked={rule.active} 
                        onCheckedChange={(checked) => toggleRuleActive(rule.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditRuleDialog(rule)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteRule(rule.id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Editar Regra' : 'Nova Regra de Alerta'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Regra</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Alerta de estoque baixo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Alerta</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quantidade">Quantidade em estoque</SelectItem>
                          <SelectItem value="validade">Dias para vencimento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="threshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Limite</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={form.watch('type') === 'quantidade' ? "Unidades" : "Dias"} 
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch('type') === 'quantidade' 
                          ? "Alerta quando o estoque for menor que este valor" 
                          : "Alerta quando faltar esta quantidade de dias para o vencimento"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de Notificação</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o canal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="push">Push Notification</SelectItem>
                          <SelectItem value="in-app">No aplicativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="imediato">Imediato</SelectItem>
                          <SelectItem value="diario">Diário</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>
                        Ativar ou desativar esta regra de alerta
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingRule ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AlertRules;
