
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

interface AlertSettings {
  checkInterval: number;
  lowStockThreshold: number;
  expirationWarningDays: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  quietHoursEnabled: boolean;
  autoCheckEnabled: boolean;
}

const defaultSettings: AlertSettings = {
  checkInterval: 24, // hours
  lowStockThreshold: 10, // units
  expirationWarningDays: 15, // days
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  quietHoursEnabled: false,
  autoCheckEnabled: true
};

const AlertSettings: React.FC = () => {
  const [settings, setSettings] = useState<AlertSettings>(defaultSettings);
  const [isModified, setIsModified] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
  }, []);

  const handleChangeSetting = (key: keyof AlertSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setIsModified(true);
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('alertSettings', JSON.stringify(settings));
      toast.success('Configurações salvas com sucesso');
      setIsModified(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações');
    }
  };

  const resetSettings = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings(defaultSettings);
      localStorage.setItem('alertSettings', JSON.stringify(defaultSettings));
      toast.success('Configurações padrão restauradas');
      setIsModified(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Verificação de Alertas</CardTitle>
          <CardDescription className="text-gray-300">Configure como e quando o sistema deve verificar por novos alertas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-center justify-between space-x-2">
            <Label htmlFor="auto-check" className="flex flex-col space-y-1 text-white">
              <span>Verificação automática</span>
              <span className="font-normal text-sm text-gray-300">
                Ativar verificação automática de alertas
              </span>
            </Label>
            <Switch
              id="auto-check"
              checked={settings.autoCheckEnabled}
              onCheckedChange={(checked) => handleChangeSetting('autoCheckEnabled', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="check-interval" className="text-white">Intervalo de verificação (horas)</Label>
              <Input
                id="check-interval"
                type="number"
                min={1}
                max={72}
                value={settings.checkInterval}
                onChange={(e) => handleChangeSetting('checkInterval', Number(e.target.value))}
                disabled={!settings.autoCheckEnabled}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-300">
                A cada quantas horas o sistema deve verificar por novos alertas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Critérios de Alerta</CardTitle>
          <CardDescription className="text-gray-300">Defina quando alertas devem ser gerados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="low-stock" className="text-white">Estoque baixo (unidades)</Label>
              <Input
                id="low-stock"
                type="number"
                min={1}
                value={settings.lowStockThreshold}
                onChange={(e) => handleChangeSetting('lowStockThreshold', Number(e.target.value))}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-300">
                Quantidade mínima para gerar alerta de estoque baixo
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration-days" className="text-white">Dias para vencimento</Label>
              <Input
                id="expiration-days"
                type="number"
                min={1}
                value={settings.expirationWarningDays}
                onChange={(e) => handleChangeSetting('expirationWarningDays', Number(e.target.value))}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-300">
                Avisar quando faltar esta quantidade de dias para o produto vencer
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Canais de Notificação</CardTitle>
          <CardDescription className="text-gray-300">Configure onde e como as notificações serão enviadas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-row items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1 text-white">
                <span>Notificações por e-mail</span>
                <span className="font-normal text-sm text-gray-300">
                  Enviar alertas por e-mail
                </span>
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleChangeSetting('emailNotifications', checked)}
              />
            </div>

            <div className="flex flex-row items-center justify-between space-x-2">
              <Label htmlFor="push-notifications" className="flex flex-col space-y-1 text-white">
                <span>Notificações push</span>
                <span className="font-normal text-sm text-gray-300">
                  Enviar alertas como notificações push no navegador
                </span>
              </Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleChangeSetting('pushNotifications', checked)}
              />
            </div>

            <div className="flex flex-row items-center justify-between space-x-2">
              <Label htmlFor="in-app-notifications" className="flex flex-col space-y-1 text-white">
                <span>Notificações no aplicativo</span>
                <span className="font-normal text-sm text-gray-300">
                  Mostrar alertas dentro do aplicativo
                </span>
              </Label>
              <Switch
                id="in-app-notifications"
                checked={settings.inAppNotifications}
                onCheckedChange={(checked) => handleChangeSetting('inAppNotifications', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardHeader>
          <CardTitle className="text-white">Horário de Silêncio</CardTitle>
          <CardDescription className="text-gray-300">Defina um período para não receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-row items-center justify-between space-x-2">
            <Label htmlFor="quiet-hours" className="flex flex-col space-y-1 text-white">
              <span>Ativar horário de silêncio</span>
              <span className="font-normal text-sm text-gray-300">
                Suspende notificações durante o período definido
              </span>
            </Label>
            <Switch
              id="quiet-hours"
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => handleChangeSetting('quietHoursEnabled', checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start" className="text-white">Início</Label>
              <Input
                id="quiet-start"
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => handleChangeSetting('quietHoursStart', e.target.value)}
                disabled={!settings.quietHoursEnabled}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiet-end" className="text-white">Fim</Label>
              <Input
                id="quiet-end"
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => handleChangeSetting('quietHoursEnd', e.target.value)}
                disabled={!settings.quietHoursEnabled}
                className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={resetSettings}
          className="border-slate-600 text-white hover:bg-slate-700"
        >
          Restaurar Padrão
        </Button>
        <Button 
          onClick={saveSettings}
          disabled={!isModified}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105"
        >
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
};

export default AlertSettings;
