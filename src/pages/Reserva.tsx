import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, differenceInDays, isBefore, startOfDay, isWithinInterval, isSameDay, parseISO } from "date-fns";
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
import { Calendar as CalendarIcon, Loader2, Users, Home, DollarSign, LogIn, ShieldAlert, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservaInsert, useCreateReserva, useBlockedDates, BlockedDateTime } from "@/integrations/supabase/reservas";
import { showError } from "@/utils/toast";

// Horários padrão
const DEFAULT_CHECK_IN_TIME = "14:00";
const DEFAULT_CHECK_OUT_TIME = "11:00";

// Lista de horários para seleção (a cada 30 minutos)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${String(hours).padStart(2, '0')}:${minutes}`;
});

// Schema de Validação
const formSchema = z.object({
  acomodacao_id: z.string().min(1, "Selecione uma acomodação."),
  check_in_date: z.date({
    required_error: "Data de Check-in é obrigatória.",
  }),
  check_out_date: z.date({
    required_error: "Data de Check-out é obrigatória.",
  }),
  check_in_time: z.string().min(1, "Horário de Check-in é obrigatório."),
  check_out_time: z.string().min(1, "Horário de Check-out é obrigatório."),
  total_hospedes: z.coerce.number().min(1, "Mínimo de 1 hóspede."),
}).refine((data) => differenceInDays(data.check_out_date, data.check_in_date) >= 1, {
    message: "O Check-out deve ser pelo menos 1 dia após o Check-in.",
    path: ["check_out_date"],
});

// Helper function to find the latest check-out time on a specific date
const getLatestCheckOutTime = (date: Date, blockedRanges: BlockedDateTime[]): string | null => {
    // Find all reservations that END on this specific date
    const checkOutsOnThisDay = blockedRanges.filter(range => 
        !range.is_manual && // Only consider reservations
        range.end_time && 
        isSameDay(parseISO(range.end_date), date)
    );
    
    if (checkOutsOnThisDay.length === 0) {
        return null;
    }
    
    // Find the latest time string (lexicographical comparison works for HH:MM)
    const latestTime = checkOutsOnThisDay.reduce((latest, current) => {
        if (!current.end_time) return latest;
        return current.end_time > latest ? current.end_time : latest;
    }, "00:00");
    
    return latestTime;
};

// Helper function to check if a date is blocked for check-in (full day block)
const isDateFullyBlocked = (date: Date, blockedRanges: BlockedDateTime[]): boolean => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return true;

    return blockedRanges.some(range => {
        const start = parseISO(range.start_date);
        const end = parseISO(range.end_date);
        
        // A date is fully blocked if it falls within a reservation/manual block period, 
        // excluding the check-out day itself.
        
        // Check if the date is an active night (start inclusive, end exclusive)
        return isWithinInterval(date, { start: start, end: end }) && !isSameDay(date, end);
    });
};

const Reserva: React.FC = () => {
  const { user, isAdmin, isLoading: isLoadingAuth } = useAuth();
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
      check_in_time: DEFAULT_CHECK_IN_TIME,
      check_out_time: DEFAULT_CHECK_OUT_TIME,
    },
  });
  
  // Watchers
  const selectedAcomodacaoId = form.watch("acomodacao_id");
  const checkInDate = form.watch("check_in_date");
  const checkOutDate = form.watch("check_out_date");
  const totalHospedes = form.watch("total_hospedes");
  const checkInTime = form.watch("check_in_time");

  const selectedAcomodacao = acomodacoes?.find(a => a.id === selectedAcomodacaoId);
  
  // Hook para buscar datas bloqueadas
  const { data: blockedDates, isLoading: isLoadingBlockedDates } = useBlockedDates(selectedAcomodacaoId);

  // Efeito para pré-selecionar a acomodação se o slug estiver na URL
  useEffect(() => {
      if (acomodacaoSlug && acomodacoes && acomodacoes.length > 0) {
          const preSelectedAcomodacao = acomodacoes.find(a => a.slug === acomodacaoSlug);
          if (preSelectedAcomodacao) {
              form.setValue("acomodacao_id", preSelectedAcomodacao.id, { shouldValidate: true });
          }
      }
  }, [acomodacaoSlug, acomodacoes, form]);

  
  // Cálculo de Preço e Noites
  const numNights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
  const precoPorNoite = selectedAcomodacao?.preco || 0;
  const valorTotal = numNights > 0 ? numNights * precoPorNoite : 0;
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  // --- Lógica de Bloqueio de Datas e Horários ---
  
  // 1. Encontra o último horário de check-out no dia de check-in selecionado
  const latestCheckOutTime = useMemo(() => {
    if (!checkInDate || !blockedDates) return null;
    return getLatestCheckOutTime(checkInDate, blockedDates);
  }, [checkInDate, blockedDates]);

  // 2. Filtra as opções de horário de check-in
  const filteredCheckInTimeOptions = useMemo(() => {
    if (!latestCheckOutTime) {
        return timeOptions.map(time => ({ time, isBlocked: false }));
    }
    
    // Se houver um check-out no dia, bloqueia horários ANTES ou IGUAIS ao último check-out.
    return timeOptions.map(time => ({
        time,
        isBlocked: time <= latestCheckOutTime,
    }));
  }, [latestCheckOutTime]);
  
  // 3. Função para desabilitar datas no calendário
  const disabledDates = (date: Date) => {
      if (!blockedDates) return false;
      
      // Se a data for totalmente bloqueada (noite ativa), desabilita.
      if (isDateFullyBlocked(date, blockedDates)) {
          return true;
      }
      
      // Se for um dia de check-out, permitimos a seleção, mas o horário será validado.
      return false;
  };
  
  // 4. Modificadores para estilizar datas bloqueadas (vermelho) e parcialmente bloqueadas (amarelo)
  const calendarModifiers = useMemo(() => {
      if (!blockedDates) return {};

      const fullyBlockedDates: Date[] = [];
      const partialBlockDates: Date[] = [];

      blockedDates.forEach(range => {
          const start = parseISO(range.start_date);
          const end = parseISO(range.end_date);
          
          // Coleta datas totalmente bloqueadas (noites)
          let current = startOfDay(start);
          const endLimit = startOfDay(end);
          
          while (isBefore(current, endLimit)) {
              fullyBlockedDates.push(current);
              current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
          }
          
          // Coleta datas parcialmente bloqueadas (dias de check-out de reservas)
          if (!range.is_manual && range.end_time) {
              const checkOutDay = startOfDay(end);
              
              // Adiciona apenas se não for um dia totalmente bloqueado (para evitar sobreposição de estilo)
              if (!fullyBlockedDates.some(blockedDate => isSameDay(checkOutDay, blockedDate))) {
                  partialBlockDates.push(checkOutDay);
              }
          }
      });

      return {
          blocked: fullyBlockedDates,
          partialBlock: partialBlockDates,
      };
  }, [blockedDates]);
  
  // 5. Validação de horário de check-in
  useEffect(() => {
      if (checkInDate && latestCheckOutTime && checkInTime) {
          // Se o horário selecionado for bloqueado, limpa o campo e mostra erro
          if (checkInTime <= latestCheckOutTime) {
              form.setError("check_in_time", {
                  type: "manual",
                  message: `O check-in só é permitido após as ${latestCheckOutTime} devido a um check-out anterior.`,
              });
          } else {
              form.clearErrors("check_in_time");
          }
      } else if (checkInDate && latestCheckOutTime && checkInTime === DEFAULT_CHECK_IN_TIME) {
          // Se o horário padrão for bloqueado, mostra erro
          if (DEFAULT_CHECK_IN_TIME <= latestCheckOutTime) {
              form.setError("check_in_time", {
                  type: "manual",
                  message: `O horário padrão de check-in (${DEFAULT_CHECK_IN_TIME}) está bloqueado. Selecione um horário após as ${latestCheckOutTime}.`,
              });
          }
      } else {
          form.clearErrors("check_in_time");
      }
  }, [checkInDate, latestCheckOutTime, checkInTime, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (isAdmin) {
        showError("Administradores não podem criar reservas através desta interface.");
        return;
    }
    
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
    
    // Verificação final de datas bloqueadas antes de submeter
    if (blockedDates) {
        // 1. Verifica se o dia de check-in está totalmente bloqueado
        if (isDateFullyBlocked(values.check_in_date, blockedDates)) {
            showError("A data de Check-in selecionada está indisponível.");
            return;
        }
        
        // 2. Verifica se o horário de check-in é válido para o dia
        if (latestCheckOutTime && values.check_in_time <= latestCheckOutTime) {
            showError(`O check-in só é permitido após as ${latestCheckOutTime} neste dia.`);
            return;
        }
        
        // 3. Verifica se o intervalo inteiro está livre (exceto o check-out day)
        let currentDate = startOfDay(values.check_in_date);
        const endDate = startOfDay(values.check_out_date);
        
        while (isBefore(currentDate, endDate)) {
            if (isDateFullyBlocked(currentDate, blockedDates)) {
                showError("O período selecionado contém datas indisponíveis.");
                return;
            }
            currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000); // Adiciona 1 dia
        }
    }

    const reservaData: ReservaInsert = {
        user_id: user.id,
        acomodacao_id: values.acomodacao_id,
        check_in_date: format(values.check_in_date, 'yyyy-MM-dd'),
        check_out_date: format(values.check_out_date, 'yyyy-MM-dd'),
        check_in_time: values.check_in_time,
        check_out_time: values.check_out_time,
        total_hospedes: values.total_hospedes,
        valor_total: valorTotal,
    };

    createReservaMutation.mutate(reservaData, {
        onSuccess: () => {
            form.reset({
                acomodacao_id: selectedAcomodacaoId,
                total_hospedes: 1,
                check_in_time: DEFAULT_CHECK_IN_TIME,
                check_out_time: DEFAULT_CHECK_OUT_TIME,
            });
            navigate("/acompanhar-reserva");
        },
    });
  }
  
  const isPending = isLoadingAuth || isLoadingAcomodacoes || createReservaMutation.isPending || isLoadingBlockedDates;
  const isFormValid = valorTotal > 0 && form.formState.isValid;
  
  // Determina o estado do botão de submissão
  let buttonText = "Solicitar Reserva";
  let buttonDisabled = isPending || !isFormValid;
  let buttonAction = form.handleSubmit(onSubmit);

  if (isAdmin) {
      buttonText = "Ação Bloqueada (Admin)";
      buttonDisabled = true;
  } else if (!user) {
      buttonText = "Fazer Login para Reservar";
      buttonDisabled = isPending || !isFormValid;
      buttonAction = () => {
          if (isFormValid) {
              showError("Você precisa estar logado para fazer uma reserva.");
              navigate("/login");
          } else {
              form.handleSubmit(onSubmit)();
          }
      };
  }
  
  // Estilos para os modificadores do calendário
  const calendarStyles = {
      blocked: { 
          backgroundColor: 'hsl(var(--destructive) / 0.1)', 
          color: 'hsl(var(--destructive))',
          borderRadius: '0',
      },
      partialBlock: {
          backgroundColor: 'hsl(40 80% 90%)', // Amarelo suave
          color: 'hsl(40 80% 40%)', // Texto amarelo escuro
          border: '1px solid hsl(40 80% 70%)',
          borderRadius: '0',
      }
  };

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
            <form onSubmit={user && !isAdmin ? form.handleSubmit(onSubmit) : (e) => {
                e.preventDefault();
                if (!user) {
                    buttonAction();
                }
            }} className="space-y-6">
              
              {/* 1. Seleção de Acomodação */}
              <FormField
                control={form.control}
                name="acomodacao_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Home className="h-4 w-4 mr-2" /> Acomodação Desejada</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || !acomodacoes || isAdmin}>
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

              {/* 2. Datas e Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Check-in */}
                <div className="space-y-4">
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
                                  disabled={isPending || !selectedAcomodacaoId || isAdmin}
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
                                disabled={disabledDates}
                                modifiers={calendarModifiers}
                                modifiersStyles={calendarStyles}
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
                      name="check_in_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Horário de Entrada</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isAdmin}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o horário" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredCheckInTimeOptions.map(({ time, isBlocked }) => (
                                <SelectItem 
                                    key={time} 
                                    value={time} 
                                    disabled={isBlocked}
                                    className={cn(isBlocked && "text-destructive/70 bg-destructive/10 cursor-not-allowed")}
                                >
                                  {time} {isBlocked && "(Bloqueado)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Horário padrão de check-in: {DEFAULT_CHECK_IN_TIME}.</p>
                          {latestCheckOutTime && checkInDate && (
                              <p className="text-xs text-yellow-700 font-medium">
                                  Check-out anterior em {format(checkInDate, "PPP", { locale: ptBR })} às {latestCheckOutTime}.
                              </p>
                          )}
                        </FormItem>
                      )}
                    />
                </div>
                
                {/* Check-out */}
                <div className="space-y-4">
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
                                  disabled={isPending || !checkInDate || isAdmin}
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
                                // Desabilita datas antes ou no mesmo dia do check-in, e datas totalmente bloqueadas
                                disabled={(date) => date <= (checkInDate || new Date()) || isDateFullyBlocked(date, blockedDates || [])}
                                modifiers={calendarModifiers}
                                modifiersStyles={calendarStyles}
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
                      name="check_out_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center"><Clock className="h-4 w-4 mr-2" /> Horário de Saída</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isAdmin}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o horário" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeOptions.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Horário padrão de check-out: {DEFAULT_CHECK_OUT_TIME}.</p>
                        </FormItem>
                      )}
                    />
                </div>
              </div>
              
              {/* Mensagem de Carregamento de Disponibilidade */}
              {selectedAcomodacaoId && isLoadingBlockedDates && (
                  <p className="text-sm text-center text-blue-500 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Verificando disponibilidade...
                  </p>
              )}

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
                        disabled={isPending || isAdmin}
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

              {/* 5. Aviso de Admin ou Login */}
              {isAdmin ? (
                  <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center text-yellow-800">
                      <p className="font-semibold flex items-center justify-center">
                          <ShieldAlert className="h-5 w-5 mr-2" />
                          Acesso Administrativo
                      </p>
                      <p className="text-sm mt-1">
                          Você está logado como administrador. Não é permitido criar reservas através desta interface.
                      </p>
                  </div>
              ) : !user && isFormValid ? (
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-center text-red-700">
                      <p className="font-semibold flex items-center justify-center">
                          <LogIn className="h-5 w-5 mr-2" />
                          Login Necessário
                      </p>
                      <p className="text-sm mt-1">
                          Para **Solicitar Reserva**, você deve estar logado.
                      </p>
                  </div>
              ) : null}
              
              <Button 
                type={user && !isAdmin ? "submit" : "button"}
                className="w-full" 
                disabled={buttonDisabled}
                onClick={!user && !isAdmin ? buttonAction : undefined}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  buttonText
                )}
              </Button>
              
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reserva;