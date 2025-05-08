
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Categoria } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const produtoSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório"),
  preco: z.coerce.number().min(0, "O preço deve ser maior que 0"),
  quantidade: z.coerce.number().min(0, "A quantidade deve ser maior que 0"),
  validade: z.date().optional(),
  codigo_rastreio: z.string().optional(),
  categoria_id: z.string().optional(),
  descricao: z.string().optional(),
});

type ProdutoFormValues = z.infer<typeof produtoSchema>;

interface ProdutoFormProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: any;
  onSubmitSuccess: () => void;
}

export function ProdutoForm({
  isOpen,
  onClose,
  produto,
  onSubmitSuccess,
}: ProdutoFormProps) {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produto?.nome || "",
      preco: produto?.preco || 0,
      quantidade: produto?.quantidade || 0,
      validade: produto?.validade ? new Date(produto.validade) : undefined,
      codigo_rastreio: produto?.codigo_rastreio || "",
      categoria_id: produto?.categoria_id || undefined,
      descricao: produto?.descricao || "",
    },
  });

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const { data, error } = await supabase
          .from("categorias")
          .select("*")
          .order("nome");
        
        if (error) throw error;
        setCategorias(data || []);
      } catch (error: any) {
        console.error("Erro ao carregar categorias:", error);
        toast("Erro ao carregar categorias", {
          description: error.message,
        });
      }
    };
    
    if (isOpen) {
      loadCategorias();
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset form with produto values when the produto changes
    if (produto) {
      form.reset({
        nome: produto.nome || "",
        preco: produto.preco || 0,
        quantidade: produto.quantidade || 0,
        validade: produto.validade ? new Date(produto.validade) : undefined,
        codigo_rastreio: produto.codigo_rastreio || "",
        categoria_id: produto.categoria_id || undefined,
        descricao: produto.descricao || "",
      });
    } else {
      form.reset({
        nome: "",
        preco: 0,
        quantidade: 0,
        validade: undefined,
        codigo_rastreio: "",
        categoria_id: undefined,
        descricao: "",
      });
    }
  }, [produto, form]);

  const onSubmit = async (values: ProdutoFormValues) => {
    if (!user?.empresaId) {
      toast("Erro ao salvar produto", {
        description: "Você não está associado a uma empresa.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const produtoData = {
        ...values,
        empresa_id: user.empresaId,
      };
      
      let response;
      
      if (produto) {
        // Update existing produto
        response = await supabase
          .from("produtos")
          .update(produtoData)
          .eq("id", produto.id)
          .select()
          .single();
      } else {
        // Insert new produto
        response = await supabase
          .from("produtos")
          .insert(produtoData)
          .select()
          .single();
      }

      if (response.error) throw response.error;

      toast(
        produto ? "Produto atualizado" : "Produto cadastrado",
        {
          description: `O produto ${values.nome} foi ${produto ? "atualizado" : "cadastrado"} com sucesso.`,
        }
      );
      
      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      toast("Erro ao salvar produto", {
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
            {produto ? "Editar Produto" : "Novo Produto"}
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
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categorias.map((categoria) => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="codigo_rastreio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Rastreio</FormLabel>
                  <FormControl>
                    <Input placeholder="Código de rastreio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Validade</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
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
                      placeholder="Descrição do produto"
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
                  : produto
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
