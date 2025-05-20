
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
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Alertas de Estoque</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="estoque-alerts">Alertas de estoque baixo</Label>
                <p className="text-sm text-muted-foreground">
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
                <Label htmlFor="validade-alerts">Alertas de validade próxima</Label>
                <p className="text-sm text-muted-foreground">
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
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Canais de Notificação</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por e-mail</Label>
                <p className="text-sm text-muted-foreground">
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
                <Label htmlFor="push-notifications">Notificações push</Label>
                <p className="text-sm text-muted-foreground">
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
                <Label htmlFor="in-app-notifications">Notificações no aplicativo</Label>
                <p className="text-sm text-muted-foreground">
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
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Configurações de Relatórios</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="report-frequency">Frequência de relatórios automáticos</Label>
                <Select 
                  value={settings.reportFrequency}
                  onValueChange={(value) => handleChange("reportFrequency", value)}
                >
                  <SelectTrigger id="report-frequency">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desativado">Desativado</SelectItem>
                    <SelectItem value="diario">Diário</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="alert-time">Horário preferido para alertas</Label>
                <Input 
                  id="alert-time"
                  type="time"
                  value={settings.alertTime}
                  onChange={(e) => handleChange("alertTime", e.target.value)}
                />
              </div>
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

export default NotificationSettings;
