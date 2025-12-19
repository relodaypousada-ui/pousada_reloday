import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Pacote, PacoteInsert, useCreatePacote, useUpdatePacote, usePacote } from "@/integrations/supabase/pacotes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PacoteMediaManager from "./PacoteMediaManager";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { showSuccess } from "@/utils/toast";

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(3, "O nome é obrigatório."),
  descricao: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().min(0.01, "O valor deve ser maior que zero."),
  categoria: z.string().optional().or(z.literal("")),
  imagem_url: z.string().url("URL de imagem inválida.").optional().or(z.literal("")), // NOVO CAMPO
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
  const pacoteId = initialData?.id;
  
  // Se estiver editando, buscamos os dados detalhados (incluindo mídia)
  const { data: fetchedPacote, isLoading: isLoadingPacote } = usePacote(pacoteId || "");
  
  // Usamos os dados buscados se estivermos editando
  const currentPacote = isEditing ? fetchedPacote : initialData;

  const createMutation = useCreatePacote();
  const updateMutation = useUpdatePacote();
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: currentPacote?.nome || "",
      descricao: currentPacote?.descricao || "",
      valor: currentPacote?.valor || 0.01,
      categoria: currentPacote?.categoria || "",
      imagem_url: currentPacote?.imagem_url || "",
    },
    values: { // Sincroniza com os dados do React Query
        nome: currentPacote?.nome || "",
        descricao: currentPacote?.descricao || "",
        valor: currentPacote?.valor || 0.01,
        categoria: currentPacote?.categoria || "",
        imagem_url: currentPacote?.imagem_url || "",
    },
    resetOptions: {
        keepDirtyValues: true,
    }
  });
  
  // Define o caminho de upload baseado no ID do pacote
  const uploadPath = useMemo(() => `pacotes/${pacoteId || 'temp'}`, [pacoteId]);
  const { uploadFile, isUploading } = useStorageUpload(uploadPath);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const url = await uploadFile(file);
        if (url) {
            form.setValue("imagem_url", url, { shouldDirty: true });
            showSuccess("Imagem principal carregada com sucesso!");
        }
        event.target.value = ''; 
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: PacoteInsert = {
        nome: values.nome,
        descricao: values.descricao || null,
        valor: Number(values.valor),
        categoria: values.categoria || null,
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
  
  if (isEditing && isLoadingPacote) {
      return (
        <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Carregando detalhes do pacote...</p>
        </div>
      );
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
                                {/* Opção para Nenhuma Categoria - Usamos um valor que não é "" */}
                                <SelectItem value="null-category">Nenhuma</SelectItem>
                                {CATEGORY_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <Separator />
        
        {/* Imagem Principal */}
        <FormField
          control={form.control}
          name="imagem_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem Principal</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                    <Input placeholder="https://exemplo.com/pacote.jpg" {...field} className="flex-1" />
                    <label htmlFor="pacote-main-image-upload" className="cursor-pointer">
                        <Button asChild variant="outline" disabled={isUploading}>
                            <div className="flex items-center">
                                {isUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                            </div>
                        </Button>
                    </label>
                    <input
                        id="pacote-main-image-upload"
                        type="file"
                        accept="image/webp, image/jpeg, image/png"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                    />
                </div>
              </FormControl>
              <FormDescription>
                {field.value ? (
                    <div className="flex items-center mt-2 text-xs text-green-600">
                        <ImageIcon className="h-3 w-3 mr-1" /> Imagem atual: {field.value.substring(0, 50)}...
                    </div>
                ) : (
                    "Insira uma URL ou faça upload de uma imagem principal para o pacote."
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator />

        {/* Gerenciador de Mídias Adicionais (Apenas em Edição) */}
        {isEditing && currentPacote && pacoteId && (
            <PacoteMediaManager 
                pacoteId={pacoteId} 
                initialMedia={currentPacote.midia || []} 
            />
        )}
        
        <Button type="submit" className="w-full" disabled={isPending || isUploading}>
          {isPending || isUploading ? (
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