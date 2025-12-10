import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { Acomodacao, AcomodacaoInsert, useCreateAcomodacao, useUpdateAcomodacao } from "@/integrations/supabase/acomodacoes";

// Schema de Validação
const formSchema = z.object({
  titulo: z.string().min(3, "O título é obrigatório."),
  slug: z.string()
    .min(3, "O slug é obrigatório e deve ser único.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens (ex: suite-master-luxo)."),
  descricao: z.string().optional(),
  capacidade: z.coerce.number().min(1, "A capacidade deve ser no mínimo 1."),
  preco: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  imagem_url: z.string().url("URL de imagem inválida.").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

interface AcomodacaoFormProps {
  initialData?: Acomodacao;
  onSuccess: () => void;
}

const AcomodacaoForm: React.FC<AcomodacaoFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const createMutation = useCreateAcomodacao();
  const updateMutation = useUpdateAcomodacao();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo || "",
      slug: initialData?.slug || "",
      descricao: initialData?.descricao || "",
      capacidade: initialData?.capacidade || 1,
      preco: initialData?.preco || 0.01,
      imagem_url: initialData?.imagem_url || "",
      is_active: initialData?.is_active ?? true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: AcomodacaoInsert = {
        ...values,
        // Garante que o preço seja enviado como número (numeric no DB)
        preco: Number(values.preco), 
        capacidade: Number(values.capacidade),
        descricao: values.descricao || null,
        imagem_url: values.imagem_url || null,
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
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Acomodação</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Suíte Master com Vista" {...field} />
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
                <Input placeholder="ex-suite-master" {...field} />
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
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea placeholder="Descreva os detalhes e comodidades..." {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="capacidade"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Capacidade Máxima (Hóspedes)</FormLabel>
                        <FormControl>
                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preço por Noite (R$)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <FormField
          control={form.control}
          name="imagem_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem Principal</FormLabel>
              <FormControl>
                <Input placeholder="https://exemplo.com/imagem.jpg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Status</FormLabel>
                <p className="text-sm text-muted-foreground">
                  {field.value ? "Acomodação visível no site." : "Acomodação oculta no site."}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Salvar Alterações"
          ) : (
            "Criar Acomodação"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AcomodacaoForm;