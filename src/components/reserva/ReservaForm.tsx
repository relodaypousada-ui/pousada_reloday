import React, { useEffect, useMemo } from "react"; // CORREÇÃO: useMemo importado
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isBefore, startOfDay, isSameDay} from "date-fns";
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
import { Calendar as CalendarIcon, Loader2, Users, Home, LogIn, ShieldAlert, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReservaInsert, useCreateReserva } from "@/integrations/supabase/reservas";
import { showError } from "@/utils/toast";

// CORREÇÃO DE IMPORTS: Importa tudo que é necessário do hook.
import { 
    useReservaLogic, 
    timeOptions, 
    formatBufferHours,
    isTimeBefore,
    STANDARD_CHECK_IN_TIME_FALLBACK, // Usamos fallbacks para o defaultValues inicial
    DEFAULT_CHECK_OUT_TIME_FALLBACK,
} from "@/hooks/useReservaLogic";
import ReservaSummary from "./ReservaSummary";


// Schema de Validação
const formSchema = z.object({
    acomodacao_id: z.string().min(1, "Selecione uma acomodação."),
    check_in_date: z.date({ required_error: "Data de Check-in é obrigatória." }),
    check_out_date: z.date({ required_error: "Data de Check-out é obrigatória." }),
    check_in_time: z.string().min(1, "Horário de Check-in é obrigatório."),
    check_out_time: z.string().min(1, "Horário de Check-out é obrigatório."),
    total_hospedes: z.coerce.number().min(1, "Mínimo de 1 hóspede."),
}).refine((data) => data.check_out_date > data.check_in_date, {
    message: "O Check-out deve ser pelo menos 1 dia após o Check-in.",
    path: ["check_out_date"],
});

type ReservaFormValues = z.infer<typeof formSchema>;

interface ReservaFormProps {
    initialAcomodacaoId?: string;
}

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

const ReservaForm: React.FC<ReservaFormProps> = ({ initialAcomodacaoId }) => {
    const { user, isAdmin, isLoading: isLoadingAuth } = useAuth();
    const navigate = useNavigate();
    const createReservaMutation = useCreateReserva();

    // 1. Instância temporária para obter horários padrão iniciais (necessário para defaultValues)
    const tempForm = useForm<ReservaFormValues>();
    const tempLogicResults = useReservaLogic(tempForm);

    // 2. Instância final do formulário
    const form = useForm<ReservaFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            acomodacao_id: initialAcomodacaoId || "",
            total_hospedes: 1,
            // Usa os valores dinâmicos/configuráveis da acomodação ou os fallbacks
            check_in_time: tempLogicResults.standardCheckInTime || STANDARD_CHECK_IN_TIME_FALLBACK,
            check_out_time: tempLogicResults.defaultCheckOutTime || DEFAULT_CHECK_OUT_TIME_FALLBACK, 
        },
    });

    // 3. Re-execução do hook com a instância final do formulário (para reagir a changes)
    const formToWatch = useMemo(() => form, [form.getValues]);
    const logicResults = useReservaLogic(formToWatch);
    
    // Desestruturação para simplificar o código
    const {
        acomodacoes, selectedAcomodacao, earliestCheckInTime, latestCheckOutTime,
        cleaningBufferHours, filteredCheckInTimeOptions, calendarModifiers,
        disabledDates, isDateFullyBlocked, numNights, valorTotal, precoPorNoite,
        standardCheckInTime: currentStandardCheckInTime, // O horário padrão configurado ATUAL
        defaultCheckOutTime, // Horário de check-out configurado ATUAL
    } = logicResults;


    const { checkInDate, checkOutDate, acomodacao_id: selectedAcomodacaoId } = form.watch();
    const isPending = isLoadingAuth || logicResults.isLoadingAcomodacoes || createReservaMutation.isPending || logicResults.isLoadingBlockedDates;


    // Sincroniza o ID inicial (inalterado)
    useEffect(() => {
        if (initialAcomodacaoId && initialAcomodacaoId !== form.getValues("acomodacao_id")) {
            form.setValue("acomodacao_id", initialAcomodacaoId, { shouldValidate: true });
        }
    }, [initialAcomodacaoId, form]);
    
    // REMOVENDO A LÓGICA DE AJUSTE DE HORÁRIO QUE ESTAVA FORÇANDO O VALOR PARA 14:00
    // O hook useReservaLogic agora cuida da validação e da lista de opções desabilitadas.
    // O valor inicial é definido no defaultValues. Se o usuário selecionar um horário inválido,
    // a validação do hook (useEffect dentro de useReservaLogic) irá disparar um erro.
    
    async function onSubmit(values: ReservaFormValues) {
        // ... (Validações e lógica de submissão inalterada)
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
        
        if (disabledDates(values.check_in_date)) {
             showError("A data de Check-in selecionada está indisponível.");
             return;
        }
        
        // Verifica se o horário selecionado está bloqueado (usando a lista filtrada do hook)
        const isTimeBlocked = filteredCheckInTimeOptions.find(opt => opt.time === values.check_in_time)?.isBlocked;
        if (isTimeBlocked) {
             showError(`O horário de check-in selecionado (${values.check_in_time}) está bloqueado. O check-in só é permitido a partir das ${earliestCheckInTime}.`);
             return;
        }
        
        let currentDate = startOfDay(values.check_in_date);
        const endDate = startOfDay(values.check_out_date);
        
        while (isBefore(currentDate, endDate)) {
             if (isDateFullyBlocked(currentDate)) {
                 showError("O período selecionado contém datas indisponíveis.");
                 return;
             }
             currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
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
                    // Usamos os valores dinâmicos para reset
                    check_in_time: currentStandardCheckInTime, 
                    check_out_time: defaultCheckOutTime,
                });
                navigate("/acompanhar-reserva");
            },
        });
    }

    const isFormValid = valorTotal > 0 && form.formState.isValid;
    
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

    return (
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
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value} 
                                disabled={isPending || !acomodacoes || isAdmin || !!initialAcomodacaoId} // Desabilita se initialAcomodacaoId existir
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={logicResults.isLoadingAcomodacoes ? "Carregando acomodações..." : "Selecione uma acomodação"} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {acomodacoes?.map((acomodacao) => (
                                        <SelectItem key={acomodacao.id} value={acomodacao.id}>
                                            {acomodacao.titulo} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acomodacao.preco)} / noite)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {!!initialAcomodacaoId && (
                                <p className="text-xs text-primary font-medium">Acomodação pré-selecionada via link.</p>
                            )}
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
                                                    disabled={isPending || isAdmin || !selectedAcomodacaoId} 
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isAdmin || !selectedAcomodacaoId || !checkInDate}>
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
                                    <p className="text-xs text-muted-foreground">Horário padrão de check-in: {currentStandardCheckInTime}.</p>
                                    {latestCheckOutTime && checkInDate && (
                                        <p className="text-xs text-yellow-700 font-medium">
                                            Check-out anterior em {format(checkInDate, "PPP", { locale: ptBR })} às {latestCheckOutTime}. Buffer de limpeza de {formatBufferHours(cleaningBufferHours)}. Check-in liberado a partir de {earliestCheckInTime}.
                                        </p>
                                    )}
                                    {!latestCheckOutTime && checkInDate && !isSameDay(checkInDate, new Date()) && (
                                        <p className="text-xs text-green-700 font-medium">
                                            Acomodação vaga. Check-in liberado a partir de {earliestCheckInTime}.
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
                                                    disabled={isPending || !form.getValues("check_in_date") || isAdmin}
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
                                                disabled={(date) => date <= (checkInDate || new Date()) || disabledDates(date)}
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
                                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isAdmin || !selectedAcomodacaoId || !checkOutDate}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o horário" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {/* Usamos timeOptions diretamente aqui */}
                                            {timeOptions.map(time => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">Horário padrão de check-out: {defaultCheckOutTime}.</p>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                
                {/* Mensagem de Carregamento de Disponibilidade */}
                {selectedAcomodacaoId && logicResults.isLoadingBlockedDates && (
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
                                    disabled={isPending || isAdmin || !selectedAcomodacaoId}
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
                <ReservaSummary 
                    selectedAcomodacaoTitle={selectedAcomodacao?.titulo}
                    numNights={numNights}
                    precoPorNoite={precoPorNoite}
                    valorTotal={valorTotal}
                />

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
    );
};

export default ReservaForm;