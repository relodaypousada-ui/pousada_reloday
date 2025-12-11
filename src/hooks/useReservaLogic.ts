import { useMemo, useEffect } from "react";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { useBlockedDates, BlockedDateTime } from "@/integrations/supabase/reservas";
import { format, differenceInDays, isBefore, startOfDay, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

// Define o Schema de Validação para tipagem interna do hook
const formSchema = z.object({
    acomodacao_id: z.string(),
    check_in_date: z.date(),
    check_out_date: z.date(),
    check_in_time: z.string(),
    check_out_time: z.string(),
    total_hospedes: z.coerce.number(),
});
type ReservaFormValues = z.infer<typeof formSchema>;

export const DEFAULT_CHECK_IN_TIME = "14:00";
export const DEFAULT_CHECK_OUT_TIME = "11:00";

export const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${String(hours).padStart(2, '0')}:${minutes}`;
});

// Helper function for robust time string comparison (t1 < t2)
const isTimeBefore = (t1: string, t2: string): boolean => {
    const [h1, m1] = t1.split(":").map(Number);
    const [h2, m2] = t2.split(":").map(Number);

    if (h1 === h2) return m1 < m2;
    return h1 < h2;
};

// Helper function for robust time string comparison (t1 > t2)
const isTimeAfter = (t1: string, t2: string): boolean => {
    const [h1, m1] = t1.split(":").map(Number);
    const [h2, m2] = t2.split(":").map(Number);

    if (h1 === h2) return m1 > m2;
    return h1 > h2;
};

// Helper function to calculate time + 1 hour buffer
const addOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + 1;
    
    if (newHours >= 24) {
        newHours -= 24;
    }
    
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * Busca o horário de check-out mais tardio que ocorre NO DIA ESPECIFICADO.
 * @param date O dia que está sendo verificado para check-in.
 * @param blockedRanges Todas as datas bloqueadas (reservas e bloqueios manuais).
 * @returns O horário de check-out mais tardio (ex: "11:00") ou null.
 */
const getLatestCheckOutTimeOnDay = (date: Date, blockedRanges: BlockedDateTime[]): string | null => {
    const checkOutsOnThisDay = blockedRanges.filter(range => 
        !range.is_manual && // Apenas reservas
        range.end_time && 
        isSameDay(parseISO(range.end_date), date)
    );
    
    if (checkOutsOnThisDay.length === 0) {
        return null;
    }
    
    // Encontra o horário mais tardio
    const latestTime = checkOutsOnThisDay.reduce((latest, current) => {
        if (!current.end_time) return latest;
        // Se o horário atual for DEPOIS do último registrado, atualiza
        return isTimeAfter(current.end_time, latest) ? current.end_time : latest;
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
        
        return isWithinInterval(date, { start: start, end: end }) && !isSameDay(date, end);
    });
};


export const useReservaLogic = (form: UseFormReturn<ReservaFormValues>) => {
    const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
    
    const selectedAcomodacaoId = form.watch("acomodacao_id");
    const checkInDate = form.watch("check_in_date");
    const checkOutDate = form.watch("check_out_date");
    const checkInTime = form.watch("check_in_time");

    const selectedAcomodacao = useMemo(() => 
        acomodacoes?.find(a => a.id === selectedAcomodacaoId), 
        [acomodacoes, selectedAcomodacaoId]
    );

    const { data: blockedDates, isLoading: isLoadingBlockedDates } = useBlockedDates(selectedAcomodacaoId);

    // --- Price and Nights Calculation ---
    const numNights = checkInDate && checkOutDate ? differenceInDays(checkOutDate, checkInDate) : 0;
    const precoPorNoite = selectedAcomodacao?.preco || 0;
    const valorTotal = numNights > 0 ? numNights * precoPorNoite : 0;

    // --- Date/Time Blocking Logic ---
    
    // 1. Busca o último check-out que ocorre NO DIA DO CHECK-IN
    const latestCheckOutTime = useMemo(() => {
        if (!checkInDate || !blockedDates) return null;
        
        // Usamos a data de check-in atual para buscar check-outs que ocorrem neste dia
        return getLatestCheckOutTimeOnDay(checkInDate, blockedDates);
    }, [checkInDate, blockedDates]);


    // 2. Calcula o horário de check-in mais cedo permitido
    const dynamicEarliestCheckInTime = latestCheckOutTime ? addOneHour(latestCheckOutTime) : "00:00";
    
    // O horário de check-in permitido é o MAIOR entre o padrão (14:00) e o dinâmico (último check-out + 1h)
    const earliestCheckInTime = isTimeAfter(dynamicEarliestCheckInTime, DEFAULT_CHECK_IN_TIME) 
        ? dynamicEarliestCheckInTime 
        : DEFAULT_CHECK_IN_TIME;


    const filteredCheckInTimeOptions = useMemo(() => {
        return timeOptions.map(time => ({
            time,
            // Bloqueia se o horário for estritamente ANTES do horário permitido
            isBlocked: isTimeBefore(time, earliestCheckInTime),
        }));
    }, [earliestCheckInTime]);

    const calendarModifiers = useMemo(() => {
        if (!blockedDates) return {};

        const fullyBlockedDates: Date[] = [];
        const partialBlockDates: Date[] = [];

        blockedDates.forEach(range => {
            const start = parseISO(range.start_date);
            const end = parseISO(range.end_date);
            
            let current = startOfDay(start);
            const endLimit = startOfDay(end);
            
         while (isBefore(current, endLimit)) {
    // Adiciona todas as noites como totalmente bloqueadas
    fullyBlockedDates.push(current);
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
}
            
            // Se for uma reserva (não manual) e tiver um horário de check-out, 
            // o dia do check-out é um bloqueio parcial (disponível após o horário de limpeza)
            if (!range.is_manual && range.end_time) {
                const checkOutDay = startOfDay(end);
                
                // Adiciona apenas se não for um dia totalmente bloqueado (o que só acontece se a reserva for de 0 noites, o que não deve ocorrer)
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

    const disabledDates = (date: Date) => {
        const today = startOfDay(new Date());
        
        // 1. Desabilita datas passadas
        if (isBefore(date, today)) {
            return true;
        }
        
        if (!blockedDates) return false;
        
        // 2. Verifica se a data está na lista de datas totalmente bloqueadas (noites de reserva/bloqueio manual)
        const isFullyBlocked = calendarModifiers.blocked?.some(blockedDate => isSameDay(date, blockedDate));
        
        // 3. Verifica se a data é um dia de check-out (partialBlock)
        const isPartialBlock = calendarModifiers.partialBlock?.some(partialDate => isSameDay(date, partialDate));

        // Se é dia de check-out, permitimos a seleção (o bloqueio de horário cuidará do resto)
        if (isPartialBlock) {
            return false;
        }

        // Se é totalmente bloqueado, desabilita
        if (isFullyBlocked) {
            return true;
        }
        
        return false;
    };
    
    // Validação de horário de check-in
    useEffect(() => {
        if (checkInDate && checkInTime) {
            // Se o horário selecionado for anterior ao horário permitido (earliestCheckInTime)
            if (isTimeBefore(checkInTime, earliestCheckInTime)) {
                form.setError("check_in_time", {
                    type: "manual",
                    message: `O check-in só é permitido a partir das ${earliestCheckInTime} devido à limpeza.`,
                });
            } else {
                form.clearErrors("check_in_time");
            }
        } else {
            form.clearErrors("check_in_time");
        }
    }, [checkInDate, checkInTime, form, earliestCheckInTime]);


    return {
        acomodacoes,
        selectedAcomodacao,
        isLoadingAcomodacoes,
        isLoadingBlockedDates,
        numNights,
        valorTotal,
        precoPorNoite,
        blockedDates,
        latestCheckOutTime,
        earliestCheckInTime,
        filteredCheckInTimeOptions,
        calendarModifiers,
        disabledDates,
        isDateFullyBlocked: (date: Date) => isDateFullyBlocked(date, blockedDates || []),
    };
};