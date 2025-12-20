import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Acomodacao, AcomodacaoInsert, useCreateAcomodacao, useUpdateAcomodacao, useAcomodacao } from "@/integrations/supabase/acomodacoes";
import { useAllComodidades } from "@/integrations/supabase/comodidades";
import { cn } from "@/lib/utils";
import MediaManager from "./MediaManager";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { showSuccess } from "@/utils/toast";

// Schema de Validação
const formSchema = z.object({
  titulo: z.string().min(3, "O título é obrigatório."),
  slug: z.string()
    .min(3, "O slug é obrigatório e deve ser único.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve conter apenas letras minúsculas, números e hífens (ex: suite-master-luxo)."),
  descricao: z.string().optional().or(z.literal("")),
  capacidade: z.coerce.number().min(1, "A capacidade deve ser no mínimo 1."),
  preco: z.coerce.number().min(0.01, "O preço deve ser maior que zero."),
  imagem_url: z.string().url("URL de imagem inválida.").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  cleaning_buffer_hours: z.coerce.number().min(0, "O buffer deve ser um número positivo."), // NOVO CAMPO
  comodidadeIds: z.array(z.string()).default([]),
});

interface AcomodacaoFormProps {
  initialData?: Acomodacao;
  onSuccess: () => void;
}

const AcomodacaoForm: React.FC<AcomodacaoFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const acomodacaoId = initialData?.id;
  
  // Se estiver editando, buscamos os dados detalhados (incluindo mídia)
  const { data: fetchedAcomodacao, isLoading: isLoadingAcomodacao } = useAcomodacao(acomodacaoId || "");
  
  // Usamos os dados buscados se estivermos editando, caso contrário, usamos initialData (que é undefined para criação)
  const currentAcomodacao = isEditing ? fetchedAcomodacao : initialData;

  const createMutation = useCreateAcomodacao();
  const updateMutation = useUpdateAcomodacao();
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  const { data: allComodidades, isLoading: isLoadingComodidades } = useAllComodidades();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: currentAcomodacao?.titulo || "",
      slug: currentAcomodacao?.slug || "",
      descricao: currentAcomodacao?.descricao || "",
      capacidade: currentAcomodacao?.capacidade || 1,
      preco: currentAcomodacao?.preco || 0.01,
      imagem_url: currentAcomodacao?.imagem_url || "",
      is_active: currentAcomodacao?.is_active ?? true,
      cleaning_buffer_hours: currentAcomodacao?.cleaning_buffer_hours || 1.0, // Valor padrão 1.0
      comodidadeIds: currentAcomodacao?.comodidades?.map(c => c.id) || [],
    },
    values: { // Usamos 'values' para sincronizar o formulário com os dados do React Query
        titulo: currentAcomodacao?.titulo || "",
        slug: currentAcomodacao?.slug || "",
        descricao: currentAcomodacao?.descricao || "",
        capacidade: currentAcomodacao?.capacidade || 1,
        preco: currentAcomodacao?.preco || 0.01,
        imagem_url: currentAcomodacao?.imagem_url || "",
        is_active: currentAcomodacao?.is_active ?? true,
        cleaning_buffer_hours: currentAcomodacao?.cleaning_buffer_hours || 1.0,
        comodidadeIds: currentAcomodacao?.comodidades?.map(c => c.id) || [],
    },
    resetOptions: {
        keepDirtyValues: true,
    }
  });
  
  // Define o caminho de upload baseado no slug (ou um placeholder se for criação)
  const currentSlug = form.watch('slug');
  const currentImageUrl = form.watch('imagem_url'); // Observa a URL da imagem
  const uploadPath = useMemo(() => `acomodacoes/${currentSlug || 'temp'}`, [currentSlug]);
  const { uploadFile, isUploading } = useStorageUpload(uploadPath);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const url = await uploadFile(file);
        if (url) {
            form.setValue("imagem_url", url, { shouldDirty: true });
            showSuccess("Imagem principal carregada com sucesso!");
        }
        // Limpa o input para permitir o upload do mesmo arquivo novamente
        event.target.value = ''; 
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: AcomodacaoInsert = {
        ...values,
        preco: Number(values.preco), 
        capacidade: Number(values.capacidade),
        cleaning_buffer_hours: Number(values.cleaning_buffer_hours), // Incluindo o buffer
        descricao: values.descricao || null,
        imagem_url: values.imagem_url || null,
        comodidadeIds: values.comodidadeIds,
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
  
  if (isEditing && isLoadingAcomodacao) {
      return (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Carregando detalhes da acomodação...</p>
        </div>
      );
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
              <FormDescription>
                Usado na URL. Deve ser único e conter apenas letras minúsculas, números e hífens.
              </FormDescription>
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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <FormField
                control={form.control}
                name="cleaning_buffer_hours"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Buffer de Limpeza (Horas)</FormLabel>
                        <FormControl>
                            <Input type="number" step="0.1" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
                        </FormControl>
                        <FormDescription>
                            Tempo necessário entre o check-out e o próximo check-in (ex: 1.5 para 1h 30m).
                        </FormDescription>
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
                <div className="flex space-x-2">
                    <Input placeholder="https://exemplo.com/imagem.jpg" {...field} className="flex-1" />
                    
                    {/* CORREÇÃO FINAL: O label agora envolve o botão e o input oculto, e o botão não tem type="button" */}
                    <label className="cursor-pointer">
                        <Button asChild variant="outline" disabled={isUploading} size="icon">
                            <div className="flex items-center">
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </div>
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
              </FormControl>
              <FormDescription>
                Insira uma URL ou faça upload de uma imagem (webp, jpg, png). Recomendado: 1200x800px.
              </FormDescription>
              <FormMessage />
              
              {/* Visualização da Imagem */}
              {currentImageUrl && (
                  <div className="mt-4 p-2 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-2 flex items-center">
                          <ImageIcon className="h-4 w-4 mr-2 text-primary" /> Pré-visualização da Imagem Principal:
                      </p>
                      <div className="w-full h-40 overflow-hidden rounded-md">
                          <img 
                              src={currentImageUrl} 
                              alt="Pré-visualização da imagem principal" 
                              className="w-full h-full object-cover"
                          />
                      </div>
                  </div>
              )}
            </FormItem>
          )}
        />
        
        {/* Seletor de Comodidades */}
        <FormField
          control={form.control}
          name="comodidadeIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Comodidades</FormLabel>
                <FormDescription>
                  Selecione as comodidades disponíveis nesta acomodação.
                </FormDescription>
              </div>
              
              {isLoadingComodidades ? (
                <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando comodidades...
                </div>
              ) : (
                <ScrollArea className="h-48 w-full rounded-md border p-4">
                  {allComodidades?.map((comodidade) => (
                    <FormField
                      key={comodidade.id}
                      control={form.control}
                      name="comodidadeIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={comodidade.id}
                            className="flex flex-row items-start space-x-3 space-y-0 py-1"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(comodidade.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, comodidade.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== comodidade.id
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className={cn(
                                "font-normal cursor-pointer",
                                field.value?.includes(comodidade.id) ? "text-primary" : "text-foreground"
                            )}>
                              {comodidade.nome}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </ScrollArea>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />
        
        {/* Gerenciador de Mídias Adicionais (Apenas em Edição) */}
        {isEditing && currentAcomodacao && acomodacaoId && (
            <MediaManager 
                acomodacaoId={acomodacaoId} 
                initialMedia={currentAcomodacao.midia || []} 
            />
        )}
        
        <Separator />


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

        <Button type="submit" className="w-full" disabled={isPending || isUploading}>
          {isPending || isUploading ? (
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