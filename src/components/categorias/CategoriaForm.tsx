
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";
import { normalizeCategoria } from "@/utils/normalizeData";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const categoriaSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório"),
  cor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Formato de cor inválido. Use formato hexadecimal (ex: #FF0000)",
  }),
  descricao: z.string().optional(),
  parentId: z.string().optional(),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

interface CategoriaFormProps {
  isOpen: boolean;
  onClose: () => void;
  categoria?: any;
  onSubmitSuccess: () => void;
}

export function CategoriaForm({
  isOpen,
  onClose,
  categoria,
  onSubmitSuccess,
}: CategoriaFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nome: categoria?.nome || "",
      cor: categoria?.cor || "#3B82F6", // Default blue color
      descricao: categoria?.descricao || "",
      parentId: categoria?.parentId || undefined,
    },
  });

  useEffect(() => {
    // Reset form with categoria values when the categoria changes
    if (categoria) {
      form.reset({
        nome: categoria.nome || "",
        cor: categoria.cor || "#3B82F6",
        descricao: categoria.descricao || "",
        parentId: categoria.parentId || undefined,
      });
    } else {
      form.reset({
        nome: "",
        cor: "#3B82F6", // Default blue color
        descricao: "",
        parentId: undefined,
      });
    }
  }, [categoria, form]);

  const onSubmit = async (values: CategoriaFormValues) => {
    // Validação robusta de empresaId
    if (!user?.empresaId || typeof user.empresaId !== 'string' || user.empresaId === 'null') {
      toast.error("Erro ao salvar categoria", {
        description: "Você precisa estar associado a uma empresa para criar categorias.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Garantir que valores opcionais sejam null, não undefined ou string "null"
      const parentId = values.parentId?.trim() ? values.parentId : null;
      
      const categoriaData = {
        nome: values.nome.trim(),
        cor: values.cor,
        descricao: values.descricao?.trim() || null,
        parent_id: parentId,
        empresa_id: user.empresaId,
      };
      
      let response;
      
      if (categoria) {
        // Update existing categoria
        response = await supabase
          .from("categorias")
          .update(categoriaData)
          .eq("id", categoria.id)
          .select()
          .single();
      } else {
        // Insert new categoria
        response = await supabase
          .from("categorias")
          .insert(categoriaData)
          .select()
          .single();
      }

      if (response.error) throw response.error;

      toast(
        categoria ? "Categoria atualizada" : "Categoria cadastrada",
        {
          description: `A categoria ${values.nome} foi ${categoria ? "atualizada" : "cadastrada"} com sucesso.`,
        }
      );
      
      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar categoria:", error);
      toast("Erro ao salvar categoria", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {categoria ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da categoria" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="color" 
                      className="w-12 h-10 p-1 cursor-pointer"
                      {...field}
                    />
                    <Input 
                      placeholder="#RRGGBB" 
                      {...field}
                      className="flex-1"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição da categoria" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Salvando..."
                  : categoria
                  ? "Atualizar"
                  : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
