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
import { Loader2, Check, X } from "lucide-react";
import { Comodidade } from "@/integrations/supabase/acomodacoes";
import { useCreateComodidade, useUpdateComodidade } from "@/integrations/supabase/comodidades";
import * as LucideIcons from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Lista de ícones Lucide comuns para comodidades
const commonIcons = [
    "Wifi", "AirVent", "Tv", "Coffee", "ParkingCircle", "Shower", "Utensils", "Sun", "Snowflake", "Bed", "Microwave", "Refrigerator"
];

// Schema de Validação
const formSchema = z.object({
  nome: z.string().min(2, "O nome é obrigatório."),
  icone: z.string().optional().or(z.literal("")),
});

interface ComodidadeFormProps {
  initialData?: Comodidade;
  onSuccess: () => void;
}

const ComodidadeForm: React.FC<ComodidadeFormProps> = ({ initialData, onSuccess }) => {
  const isEditing = !!initialData;
  const createMutation = useCreateComodidade();
  const updateMutation = useUpdateComodidade();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: initialData?.nome || "",
      icone: initialData?.icone || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit = {
        nome: values.nome,
        icone: values.icone || null,
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
  
  const selectedIconName = form.watch("icone");
  const SelectedIcon = selectedIconName ? (LucideIcons as any)[selectedIconName] : null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Comodidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Ar Condicionado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="icone"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ícone Lucide (Opcional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {SelectedIcon ? (
                      <div className="flex items-center">
                        <SelectedIcon className="mr-2 h-4 w-4" />
                        {field.value}
                      </div>
                    ) : (
                      "Selecione um ícone..."
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <ScrollArea className="h-60">
                    <div className="p-2 space-y-1">
                      {commonIcons.map((iconName) => {
                        const IconComponent = (LucideIcons as any)[iconName];
                        const isSelected = field.value === iconName;
                        return (
                          <div
                            key={iconName}
                            onClick={() => {
                              field.onChange(iconName);
                            }}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                              isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          >
                            <div className="flex items-center">
                              {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                              {iconName}
                            </div>
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        );
                      })}
                      <div 
                        onClick={() => field.onChange("")}
                        className="flex items-center p-2 rounded-md cursor-pointer hover:bg-destructive/10 text-destructive"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remover Seleção
                      </div>
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : isEditing ? (
            "Salvar Comodidade"
          ) : (
            "Criar Comodidade"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ComodidadeForm;