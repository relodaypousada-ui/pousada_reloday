import React, { useState } from "react";
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
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useCreateManualBlock } from "@/integrations/supabase/reservas";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { showError } from "@/utils/toast";

// Schema de Validação
const formSchema = z.object({
  acomodacao_id: z.string().min(1, "Selecione uma acomodação."),
  data_inicio: z.date({
    required_error: "Data de Início é obrigatória.",
  }),
  data_fim: z.date({
    required_error: "Data de Fim é obrigatória.",
  }),
  motivo: z.string().optional().or(z.literal("")),
}).refine((data) => data.data_fim > data.data_inicio, {
    message: "A Data de Fim deve ser posterior à Data de Início.",
    path: ["data_fim"],
});

interface BloqueioFormProps {
  onSuccess: () => void;
}

const BloqueioForm: React.FC<BloqueioFormProps> = ({ onSuccess }) => {
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
  const createMutation = useCreateManualBlock();
  const isPending = createMutation.isPending;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acomodacao_id: "",
      motivo: "",
    },
  });
  
  const dataInicio = form.watch("data_inicio");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const dataToSubmit = {
        acomodacao_id: values.acomodacao_id,
        data_inicio: format(values.data_inicio, 'yyyy-MM-dd'),
        data_fim: format(values.data_fim, 'yyyy-MM-dd'),
        motivo: values.motivo || null,
    };

    createMutation.mutate(dataToSubmit, {
        onSuccess: () => {
            form.reset({
                acomodacao_id: values.acomodacao_id, // Mantém a acomodação selecionada
                motivo: "",
                data_inicio: undefined,
                data_fim: undefined,
            });
            onSuccess();
        },
        onError: (error) => {
            showError(error.message);
        }
    });
  }
  
  const disabledPastDates = (date: Date) => isBefore(date, startOfDay(new Date()));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="acomodacao_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Acomodação a Bloquear</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isLoadingAcomodacoes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingAcomodacoes ? "Carregando acomodações..." : "Selecione uma acomodação"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {acomodacoes?.map((acomodacao) => (
                    <SelectItem key={acomodacao.id} value={acomodacao.id}>
                      {acomodacao.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="data_inicio"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início (Check-in)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isPending}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
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
                        disabled={disabledPastDates}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="data_fim"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Fim (Check-out)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isPending || !dataInicio}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione a data</span>
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
                        disabled={(date) => date <= (dataInicio || new Date())}
                        initialFocus
                        locale={ptBR}
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
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo do Bloqueio (Opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Manutenção da piscina, Feriado de Carnaval" {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Bloquear Período"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BloqueioForm;