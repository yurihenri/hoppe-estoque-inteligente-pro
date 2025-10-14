
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
import { CalendarIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Categoria } from "@/types";
import { normalizeCategoria } from "@/utils/normalizeData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const produtoSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório"),
  preco: z.coerce.number().min(0, "O preço deve ser maior que 0"),
  quantidade: z.coerce.number().min(0, "A quantidade deve ser maior que 0"),
  validade: z.date().optional(),
  codigo_rastreio: z.string().optional(),
  categoria_id: z.string().optional(),
  nova_categoria: z.string().optional(),
  nova_categoria_cor: z.string().optional(),
  descricao: z.string().optional(),
  data_entrada: z.date().optional(),
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
  const [showNovaCategoriaInput, setShowNovaCategoriaInput] = useState(false);
  const [showCorConfirmacao, setShowCorConfirmacao] = useState(false);

  const form = useForm<ProdutoFormValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produto?.nome || "",
      preco: produto?.preco || 0,
      quantidade: produto?.quantidade || 0,
      validade: produto?.validade ? new Date(produto.validade) : undefined,
      codigo_rastreio: produto?.codigo_rastreio || "",
      categoria_id: produto?.categoria_id || undefined,
      nova_categoria: "",
      nova_categoria_cor: "#3B82F6", // Default blue color
      descricao: produto?.descricao || "",
      data_entrada: produto?.data_entrada ? new Date(produto.data_entrada) : new Date(),
    },
  });

  useEffect(() => {
    const loadCategorias = async () => {
      if (!user?.empresaId) {
        toast.error("Erro ao carregar categorias", {
          description: "Você precisa estar associado a uma empresa.",
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from("categorias")
          .select("*")
          .eq("empresa_id", user.empresaId)
          .order("nome");
        
        if (error) {
          throw error;
        }
        
        // Transform the data to match our Categoria type
        const normalizedCategorias = data?.map(cat => normalizeCategoria(cat)) || [];
        setCategorias(normalizedCategorias);
      } catch (error: any) {
        console.error("[ProdutoForm] Erro ao carregar categorias:", error);
        toast.error("Erro ao carregar categorias", {
          description: error.message || "Verifique se você tem permissão para acessar as categorias.",
        });
      }
    };
    
    if (isOpen) {
      loadCategorias();
    }
  }, [isOpen, user?.empresaId]);

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
        nova_categoria: "",
        nova_categoria_cor: "#3B82F6",
        descricao: produto.descricao || "",
        data_entrada: produto.data_entrada ? new Date(produto.data_entrada) : new Date(),
      });
    } else {
      form.reset({
        nome: "",
        preco: 0,
        quantidade: 0,
        validade: undefined,
        codigo_rastreio: "",
        categoria_id: undefined,
        nova_categoria: "",
        nova_categoria_cor: "#3B82F6",
        descricao: "",
        data_entrada: new Date(),
      });
    }
  }, [produto, form]);

  const handleAddNovaCategoria = async () => {
    try {
      const novaCategoriaValue = form.getValues("nova_categoria");
      const novaCategoriaCor = form.getValues("nova_categoria_cor");
      
      if (!novaCategoriaValue || novaCategoriaValue.trim() === "" || !user?.empresaId) {
        return;
      }
      
      const { data, error } = await supabase
        .from("categorias")
        .insert({
          nome: novaCategoriaValue,
          cor: novaCategoriaCor,
          empresa_id: user.empresaId,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const novaCategoria = normalizeCategoria(data);
      setCategorias(cats => [...cats, novaCategoria]);
      
      // Set the new category ID in the form
      form.setValue("categoria_id", novaCategoria.id);
      
      // Reset the nova_categoria field and hide the input
      form.setValue("nova_categoria", "");
      setShowNovaCategoriaInput(false);
      
      toast("Categoria adicionada", {
        description: `A categoria ${novaCategoria.nome} foi criada com sucesso.`,
      });
    } catch (error: any) {
      console.error("Erro ao adicionar categoria:", error);
      toast("Erro ao adicionar categoria", {
        description: error.message,
      });
    }
  };

  const onSubmit = async (values: ProdutoFormValues) => {
    // Validação robusta de empresaId
    if (!user?.empresaId || typeof user.empresaId !== 'string' || user.empresaId === 'null') {
      toast.error("Erro ao salvar produto", {
        description: "Você precisa estar associado a uma empresa para criar produtos.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // First, check if we need to create a new category
      // Garantir que categoria_id seja null se não for um UUID válido
      let categoriaId = values.categoria_id?.trim() ? values.categoria_id : null;
      
      if (values.nova_categoria && values.nova_categoria.trim() !== "") {
        const { data, error } = await supabase
          .from("categorias")
          .insert({
            nome: values.nova_categoria,
            cor: values.nova_categoria_cor || "#3B82F6",
            empresa_id: user.empresaId,
          })
          .select()
          .single();
        
        if (error) throw error;
        
        categoriaId = data.id;
        
        // Add to the categories list
        const novaCategoria = normalizeCategoria(data);
        setCategorias(cats => [...cats, novaCategoria]);
        
        toast("Categoria adicionada", {
          description: `A categoria ${values.nova_categoria} foi criada e associada ao produto.`,
        });
      }
      
      const produtoData = {
        nome: values.nome.trim(),
        preco: values.preco,
        quantidade: values.quantidade,
        validade: values.validade ? values.validade.toISOString().split('T')[0] : null,
        codigo_rastreio: values.codigo_rastreio?.trim() || null,
        categoria_id: categoriaId, // Já validado acima
        descricao: values.descricao?.trim() || null,
        empresa_id: user.empresaId,
        data_entrada: values.data_entrada ? values.data_entrada.toISOString() : new Date().toISOString(),
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

      if (response.error) {
        throw response.error;
      }

      toast.success(
        produto ? "Produto atualizado" : "Produto cadastrado",
        {
          description: `O produto ${values.nome} foi ${produto ? "atualizado" : "cadastrado"} com sucesso.`,
        }
      );
      
      onSubmitSuccess();
      onClose();
    } catch (error: any) {
      console.error("[ProdutoForm] Erro ao salvar produto:", error);
      
      // Tratamento específico para erros de RLS
      let errorMessage = error.message;
      if (error.message?.includes('row-level security')) {
        errorMessage = "Você não tem permissão para realizar esta ação. Verifique se está associado à empresa correta.";
      } else if (error.message?.includes('duplicate key')) {
        errorMessage = "Já existe um produto com essas informações.";
      }
      
      toast.error("Erro ao salvar produto", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
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

              {showNovaCategoriaInput ? (
                <>
                  <FormField
                    control={form.control}
                    name="nova_categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Categoria*</FormLabel>
                        <div className="flex gap-2">
                          <FormControl className="flex-1">
                            <Input placeholder="Nome da nova categoria" {...field} />
                          </FormControl>
                          <FormField
                            control={form.control}
                            name="nova_categoria_cor"
                            render={({ field: colorField }) => (
                              <FormControl>
                                <Input
                                  type="color"
                                  className="w-12 h-10 p-1 cursor-pointer"
                                  {...colorField}
                                />
                              </FormControl>
                            )}
                          />
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setShowNovaCategoriaInput(false);
                              form.setValue("nova_categoria", "");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
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
                          <div className="flex gap-2 w-full">
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <Button 
                              type="button" 
                              size="icon" 
                              onClick={() => setShowNovaCategoriaInput(true)}
                              title="Adicionar nova categoria"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: categoria.cor }}
                                />
                                {categoria.nome}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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

              <div className="grid grid-cols-2 gap-4">
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
                            disabled={(date) => date < new Date() && !produto}
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
                  name="data_entrada"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Entrada</FormLabel>
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
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

      {/* Confirmation dialog for adding a category */}
      <AlertDialog open={showCorConfirmacao} onOpenChange={setShowCorConfirmacao}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escolha uma cor para a categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Selecione uma cor para identificar a categoria {form.getValues("nova_categoria")}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <FormField
              control={form.control}
              name="nova_categoria_cor"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <Input 
                      type="color"
                      className="w-20 h-10 p-1 cursor-pointer"
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
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAddNovaCategoria}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
