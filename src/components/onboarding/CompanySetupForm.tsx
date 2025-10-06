import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

const companySchema = z.object({
  nome: z.string().trim().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  cnpj: z.string().trim().optional(),
  segmento: z.string().trim().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

const CompanySetupForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const onSubmit = async (data: CompanyFormData) => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Buscar o plano gratuito
      const { data: freePlan, error: planError } = await supabase
        .from("plans")
        .select("id")
        .eq("type", "free")
        .single();

      if (planError) throw planError;

      // 2. Criar a empresa
      const { data: newEmpresa, error: empresaError } = await supabase
        .from("empresas")
        .insert({
          nome: data.nome,
          cnpj: data.cnpj || null,
          segmento: data.segmento || null,
          current_plan_id: freePlan.id,
        })
        .select()
        .single();

      if (empresaError) throw empresaError;

      // 3. Atualizar o perfil do usuário com o empresa_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ empresa_id: newEmpresa.id })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast.success("Empresa criada com sucesso!");
      
      // 4. Recarregar a página para atualizar o contexto de autenticação
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Erro ao criar empresa:", error);
      toast.error(error.message || "Erro ao criar empresa. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome da Empresa *</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="nome"
            placeholder="Ex: Minha Empresa LTDA"
            className="pl-10"
            {...register("nome")}
          />
        </div>
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ (opcional)</Label>
        <Input
          id="cnpj"
          placeholder="00.000.000/0000-00"
          {...register("cnpj")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="segmento">Segmento (opcional)</Label>
        <Input
          id="segmento"
          placeholder="Ex: Varejo, Indústria, Serviços"
          {...register("segmento")}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando empresa...
          </>
        ) : (
          "Criar Empresa e Começar"
        )}
      </Button>
    </form>
  );
};

export default CompanySetupForm;
