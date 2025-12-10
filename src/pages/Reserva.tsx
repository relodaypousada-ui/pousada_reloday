import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Loader2, Users, Home, DollarSign } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservaInsert, useCreateReserva } from "@/integrations/supabase/reservas";
import { showError } from "@/utils/toast";

// Schema de Validação
const formSchema = z.object({
  acomodacao_id: z.string().min(1, "Selecione uma acomodação."),
  check_in_date: z.date({
    required_error: "Data de Check-in é obrigatória.",
  }),
  check_out_date: z.date({
    required_error: "Data de Check-out é obrigatória.",
  }),
  total_hospedes: z.coerce.number().min(1, "Mínimo de 1 hóspede."),
}).refine((data) => differenceInDays(data.check_out_date, data.check_in_date) >= 1, {
    message: "O Check-out deve ser pelo menos 1 dia após o Check-in.",
    path: ["check_out_date"],
});

const Reserva: React.FC = () => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const acomodacaoSlug = searchParams.get('acomodacao_slug');
  
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
  const createReservaMutation = useCreateReserva();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acomodacao_id: "",
      total_hospedes: 1,
    },
  });
  
  // Efeito para pré-selecionar a acomodação se o slug estiver na URL
  useEffect(() => {
      if (acomodacaoSlug && acomodacoes && acomodacoes.length > 0) {
          const preSelectedAcomodacao = acomodacoes.find(a => a.slug === acomodacaoSlug);
          if (preSelectedAcomodacao) {
              form.setValue("acomodacao_id", preSelectedAcomodacao.id, { shouldValidate: true });
          }
      }
  }, [acomodacaoSlug, acomodacoes, form]);

  const selectedAcomodacaoId = form.watch("acomodacao_id");
  const checkInDate = form.watch("check_in_date");
  const checkOutDate = form.watch("check_out_date");
  const totalHospedes = form.watch("total_hospedes");

  const selectedAcomodacao = acomodacoes?.find(a => a.id === selectedAcomodacaoId);
  
  // Cálculo de Preço e Noites
  const numNights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const precoPorNoite = selectedAcomodacao?.preco || 0;
  const valorTotal = numNights > 0 ? numNights * precoPorNoite : 0;
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        showError("Você precisa estar logado para fazer uma reserva.");
        navigate("/login");
        return;
    }
    
    if (!selectedAcomodacao) {
        showError("A acomodação selecionada é inválida.");
        return;
    }
    
    if (values.total_hospedes > selectedAcomodacao.capacidade) {
        showError(`A capacidade máxima desta acomodação é de ${selectedAcomodacao.capacidade} hóspedes.`);
        return;
    }

    const reservaData: ReservaInsert = {
        user_id: user.id,
        acomodacao_id: values.acomodacao_id,
        check_in_date: format(values.check_in_date, 'yyyy-MM-dd'),
        check_out_date: format(values.check_out_date, 'yyyy-MM-dd'),
        total_hospedes: values.total_hospedes,
        valor_total: valorTotal,
    };

    createReservaMutation.mutate(reservaData, {
        onSuccess: () => {
            form.reset();
            navigate("/acompanhar-reserva");
        },
    });
  }
  
  const isPending = isLoadingAuth || isLoadingAcomodacoes || createReservaMutation.isPending;

  return (
    <div className="container py-12 min-h-[60vh] flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Fazer Sua Reserva</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os detalhes para solicitar sua estadia.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* 1. Seleção de Acomodação */}
              <FormField
                control={form.control}
                name="acomodacao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="h-4 w-4 mr-2" /> Acomodação Desejada</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || !acomodacoes}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isLoadingAcomodacoes ? "Carregando acomodações..." : "Selecione uma acomodação"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {acomodacoes?.map((acomodacao) => (
                          <SelectItem key={acomodacao.id} value={acomodacao.id}>
                            {acomodacao.titulo} ({formatCurrency(acomodacao.preco)} / noite)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 2. Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="check_in_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> Check-in</FormLabel>
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
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                  name="check_out_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" /> Check-out</FormLabel>
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
                            disabled={(date) => date <= (checkInDate || new Date()) || date < new Date("1900-01-01")}
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

              {/* 3. Hóspedes */}
              <FormField
                control={form.control}
                name="total_hospedes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Users className="h-4 w-4 mr-2" /> Número de Hóspedes</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="1" 
                        min={1}
                        max={selectedAcomodacao?.capacidade || 10}
                        {...field} 
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                        disabled={isPending}
                      />
                    </FormControl>
                    {selectedAcomodacao && (
                        <p className="text-xs text-muted-foreground">Capacidade máxima: {selectedAcomodacao.capacidade} hóspedes.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* 4. Resumo da Reserva */}
              <Card className="bg-accent/50 p-4 space-y-2">
                  <h3 className="text-lg font-semibold">Resumo da Reserva</h3>
                  <div className="flex justify-between text-sm">
                      <span>Acomodação:</span>
                      <span className="font-medium">{selectedAcomodacao?.titulo || "Selecione acima"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span>Noites:</span>
                      <span className="font-medium">{numNights}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span>Preço por Noite:</span>
                      <span className="font-medium">{formatCurrency(precoPorNoite)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-accent-foreground/20">
                      <span className="text-xl font-bold flex items-center"><DollarSign className="h-5 w-5 mr-1" /> Valor Total:</span>
                      <span className="text-xl font-bold text-primary">{formatCurrency(valorTotal)}</span>
                  </div>
              </Card>

              {/* 5. Botão de Submissão */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isPending || valorTotal <= 0 || !form.formState.isValid}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Solicitar Reserva"
                )}
              </Button>
              
              {!user && (
                  <p className="text-center text-sm text-red-500">
                      Você deve estar logado para solicitar uma reserva.
                  </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reserva;