import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Slide, SlideInsert, useCreateSlide, useUpdateSlide } from "@/integrations/supabase/slides";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { showSuccess } from "@/utils/toast";

// Schema de Validação
const formSchema = z.object({
  titulo: z.string().min(3, "O título é obrigatório."),
  subtitulo: z.string().optional().or(z.literal("")),
  imagem_url: z.string().url("URL de imagem inválida.").min(1, "A URL da imagem é obrigatória."),
  cta_label: z.string().optional().or(z.literal("")),
  cta_href: z.string().optional().or(z.literal("")),
  ordem: z.coerce.number().min(0, "A ordem deve ser um número positivo."),
  is_active: z.boolean().default(true),
});

interface SlideFormProps {
  initialData?: Slide;
  onSuccess: () => void;
}

const SlideForm: React.FC<SlideFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const createMutation = useCreateSlide();
  const updateMutation = useUpdateSlide();
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: initialData?.titulo || "",
      subtitulo: initialData?.subtitulo || "",
      imagem_url: initialData?.imagem_url || "",
      cta_label: initialData?.cta_label || "",
      cta_href: initialData?.cta_href || "",
      ordem: initialData?.ordem || 0,
      is_active: initialData?.is_active ?? true,
    },
  });
  
  // O caminho de upload é fixo para slides
  const uploadPath = useMemo(() => `slides`, []);
  const { uploadFile, isUploading } = useStorageUpload(uploadPath);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const url = await uploadFile(file);
        if (url) {
            form.setValue("imagem_url", url, { shouldDirty: true });
            showSuccess("Imagem do slide carregada com sucesso!");
        }
        event.target.value = ''; 
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit: SlideInsert = {
        ...values,
        subtitulo: values.subtitulo || null,
        cta_label: values.cta_label || null,
        cta_href: values.cta_href || null,
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
              <FormLabel>Título Principal</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Bem-vindo à Pousada Reloday" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subtitulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Input placeholder="Seu refúgio de paz e natureza espera por você." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="cta_label"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Rótulo do Botão (CTA)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Reservar Agora" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="cta_href"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Link do Botão (CTA)</FormLabel>
                        <FormControl>
                            <Input placeholder="/reserva" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="ordem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem de Exibição</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} />
              </FormControl>
              <FormDescription>
                Slides com menor número aparecem primeiro.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagem_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem de Fundo</FormLabel>
              <FormControl>
                <div className="flex space-x-2">
                    <Input placeholder="https://exemplo.com/slide.jpg" {...field} className="flex-1" />
                    <label htmlFor="slide-image-upload" className="cursor-pointer">
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
                        id="slide-image-upload"
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
                    "Insira uma URL ou faça upload de uma imagem. Recomendado: 1920x800px (proporção 2.4:1)."
                )}
              </FormDescription>
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
                  {field.value ? "Slide visível no carrossel." : "Slide oculto."}
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
            "Salvar Slide"
          ) : (
            "Criar Slide"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SlideForm;