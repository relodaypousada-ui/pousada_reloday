import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Pacote, PacoteInsert, useCreatePacote, useUpdatePacote } from "@/integrations/supabase/pacotes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  descricao: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().min(0.01, "O valor deve ser maior que zero."),
  categoria: z.string().optional().or(z.literal("")),
});

interface PacoteFormProps {
  initialData?: Pacote;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
    { value: "promocional", label: "Promocional" },
    { value: "feriado", label: "Feriado" },
    { value: "especial", label: "Especial" },
    { value: "padrao", label: "Padrão" },
];

const PacoteForm: React.FC<PacoteFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const createMutation = useCreatePacote();
  const updateMutation = useUpdatePacote();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      descricao: initialData?.descricao || "",
      valor: initialData?.valor || 0.01,
      categoria: initialData?.categoria || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: PacoteInsert = {
        nome: values.nome,
        descricao: values.descricao || null,
        valor: Number(values.valor),
        categoria: values.categoria || null,
    };

    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, updates: dataToSubmit }, {
        onSuccess: onSuccess,
      });
    } else {
      createMutation.mutate(dataToSubmit, {
        onSuccess: onSuccess,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Pacote</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pacote Romântico de Fim de Semana" {...field} />
              </FormControl>
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
                <Textarea placeholder="Detalhes do que está incluso no pacote..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valor Total (R$)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" placeholder="999.90" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Categoria (Opcional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {CATEGORY_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                                <SelectItem value="">Nenhuma</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Salvar Pacote"
          ) : (
            "Criar Pacote"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default PacoteForm;