import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { CategoriaPacote, CategoriaPacoteInsert, useCreateCategoriaPacote, useUpdateCategoriaPacote } from "@/integrations/supabase/categoriasPacotes";

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório."),
  slug: z.string()
    .min(2, "O slug é obrigatório.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens (ex: feriado-pascoa)."),
});

interface CategoriaPacoteFormProps {
  initialData?: CategoriaPacote;
  onSuccess: () => void;
}

const CategoriaPacoteForm: React.FC<CategoriaPacoteFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const createMutation = useCreateCategoriaPacote();
  const updateMutation = useUpdateCategoriaPacote();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      slug: initialData?.slug || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: CategoriaPacoteInsert = {
        nome: values.nome,
        slug: values.slug,
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
              <FormLabel>Nome da Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Feriados" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL amigável)</FormLabel>
              <FormControl>
                <Input placeholder="ex: feriados" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Salvar Categoria"
          ) : (
            "Criar Categoria"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CategoriaPacoteForm;