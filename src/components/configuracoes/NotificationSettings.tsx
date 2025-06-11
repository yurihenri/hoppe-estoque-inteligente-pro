
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    estoqueAlerts: localStorage.getItem("notif_estoqueAlerts") === "true",
    validadeAlerts: localStorage.getItem("notif_validadeAlerts") === "true",
    emailNotifications: localStorage.getItem("notif_emailNotifications") === "true",
    pushNotifications: localStorage.getItem("notif_pushNotifications") === "true",
    inAppNotifications: localStorage.getItem("notif_inAppNotifications") === "true" || true,
    reportFrequency: localStorage.getItem("notif_reportFrequency") || "semanal",
    alertTime: localStorage.getItem("notif_alertTime") || "08:00",
  });
  
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    setIsUpdating(true);
    
    // Save all settings to localStorage
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(`notif_${key}`, value.toString());
    });
    
    // Simulate API save
    setTimeout(() => {
      setIsUpdating(false);
      toast.success("Configurações de notificações salvas com sucesso!");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 text-white">Alertas de Estoque</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="estoque-alerts" className="text-white">Alertas de estoque baixo</Label>
                <p className="text-sm text-gray-300">
                  Receber notificações quando produtos atingirem o estoque mínimo
                </p>
              </div>
              <Switch 
                id="estoque-alerts"
                checked={settings.estoqueAlerts}
                onCheckedChange={() => handleToggle("estoqueAlerts")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="validade-alerts" className="text-white">Alertas de validade próxima</Label>
                <p className="text-sm text-gray-300">
                  Receber notificações sobre produtos com data de validade próxima
                </p>
              </div>
              <Switch 
                id="validade-alerts"
                checked={settings.validadeAlerts}
                onCheckedChange={() => handleToggle("validadeAlerts")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 text-white">Canais de Notificação</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-white">Notificações por e-mail</Label>
                <p className="text-sm text-gray-300">
                  Receber alertas por e-mail
                </p>
              </div>
              <Switch 
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-white">Notificações push</Label>
                <p className="text-sm text-gray-300">
                  Receber notificações push no navegador
                </p>
              </div>
              <Switch 
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleToggle("pushNotifications")}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="in-app-notifications" className="text-white">Notificações no aplicativo</Label>
                <p className="text-sm text-gray-300">
                  Receber alertas dentro do aplicativo
                </p>
              </div>
              <Switch 
                id="in-app-notifications"
                checked={settings.inAppNotifications}
                onCheckedChange={() => handleToggle("inAppNotifications")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-[#334155] backdrop-blur-sm hover:from-[#334155] hover:to-[#1E293B] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-blue-500/20">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4 text-white">Configurações de Relatórios</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-frequency" className="text-white">Frequência de relatórios automáticos</Label>
                <Select 
                  value={settings.reportFrequency}
                  onValueChange={(value) => handleChange("reportFrequency", value)}
                >
                  <SelectTrigger id="report-frequency" className="bg-slate-800/50 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="desativado" className="text-white hover:bg-slate-700">Desativado</SelectItem>
                    <SelectItem value="diario" className="text-white hover:bg-slate-700">Diário</SelectItem>
                    <SelectItem value="semanal" className="text-white hover:bg-slate-700">Semanal</SelectItem>
                    <SelectItem value="mensal" className="text-white hover:bg-slate-700">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-time" className="text-white">Horário preferido para alertas</Label>
                <Input 
                  id="alert-time"
                  type="time"
                  value={settings.alertTime}
                  onChange={(e) => handleChange("alertTime", e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          <Button 
            onClick={saveSettings} 
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:scale-105" 
            disabled={isUpdating}
          >
            {isUpdating ? "Salvando..." : "Salvar configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
