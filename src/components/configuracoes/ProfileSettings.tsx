
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from '@supabase/supabase-js';

interface ProfileSettingsProps {
  user: User | null;
}

type ProfileFormValues = {
  nome: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  idioma: string;
  formatoData: string;
};

const ProfileSettings = ({ user }: ProfileSettingsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { theme, setTheme } = useTheme();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    defaultValues: {
      nome: user?.user_metadata?.nome || "",
      email: user?.email || "",
      idioma: localStorage.getItem("idioma") || "pt-BR",
      formatoData: localStorage.getItem("formatoData") || "DD/MM/YYYY",
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        email: data.email,
        data: { nome: data.nome }
      });

      if (error) throw error;
      
      // Save preferences to localStorage
      localStorage.setItem("idioma", data.idioma);
      localStorage.setItem("formatoData", data.formatoData);
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao atualizar perfil: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordChange = async (data: ProfileFormValues) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      setIsChangingPassword(false);
    } catch (error: any) {
      toast.error(`Erro ao atualizar senha: ${error.message}`);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast.success(`Tema ${newTheme === "dark" ? "escuro" : "claro"} aplicado`);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      // Upload avatar to storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}`, file, {
          upsert: true,
          contentType: file.type
        });

      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}`);
        
      // Update user metadata with avatar URL
      await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });
      
      toast.success("Avatar atualizado com sucesso!");
    } catch (error: any) {
      toast.error(`Erro ao fazer upload do avatar: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>{user?.user_metadata?.nome?.slice(0, 2) || user?.email?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center">
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button variant="ghost" type="button" size="sm">
                    Alterar foto
                  </Button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
            </div>
            
            <div className="flex-1">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input 
                      id="nome" 
                      {...register("nome", { required: "Nome é obrigatório" })} 
                    />
                    {errors.nome && (
                      <p className="text-sm text-destructive">{errors.nome.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      {...register("email", { 
                        required: "E-mail é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "E-mail inválido"
                        }
                      })} 
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idioma">Idioma</Label>
                    <Select defaultValue={localStorage.getItem("idioma") || "pt-BR"}>
                      <SelectTrigger id="idioma">
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="formatoData">Formato de data</Label>
                    <Select defaultValue={localStorage.getItem("formatoData") || "DD/MM/YYYY"}>
                      <SelectTrigger id="formatoData">
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
                
                <div className="flex items-center space-x-2 pt-2">
                  <Label htmlFor="theme-toggle">Tema escuro</Label>
                  <Switch
                    id="theme-toggle"
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
                
                <Button type="submit" className="mt-4" disabled={isUpdating}>
                  {isUpdating ? "Salvando..." : "Salvar alterações"}
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-4">Alterar senha</h3>
          <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input 
                id="currentPassword" 
                type="password" 
                {...register("currentPassword", { required: "Senha atual é obrigatória" })} 
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input 
                  id="newPassword" 
                  type="password" 
                  {...register("newPassword", { 
                    required: "Nova senha é obrigatória",
                    minLength: {
                      value: 8,
                      message: "A senha deve ter pelo menos 8 caracteres"
                    }
                  })} 
                />
                {errors.newPassword && (
                  <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  {...register("confirmPassword", { 
                    required: "Confirmação de senha é obrigatória",
                    validate: (value, formValues) => 
                      value === formValues.newPassword || "As senhas não coincidem"
                  })} 
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              variant="outline" 
              className="mt-2"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
