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

const DEFAULT_CHECK_IN_TIME = "14:00";
const DEFAULT_CHECK_OUT_TIME = "11:00";

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? '00' : '30';
    return `${String(hours).padStart(2, '0')}:${minutes}`;
});

// Helper function to calculate time + 1 hour buffer
const addOneHour = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    let newHours = hours + 1;
    
    if (newHours >= 24) {
        newHours -= 24;
    }
    
    return `${String(newHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper function to find the latest check-out time on a specific date
const getLatestCheckOutTime = (date: Date, blockedRanges: BlockedDateTime[]): string | null => {
    const checkOutsOnThisDay = blockedRanges.filter(range => 
        !range.is_manual && // Only consider reservations
        range.end_time && 
        isSameDay(parseISO(range.end_date), date)
    );
    
    if (checkOutsOnThisDay.length === 0) {
        return null;
    }
    
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
    
    const latestCheckOutTime = useMemo(() => {
        if (!checkInDate || !blockedDates) return null;
        return getLatestCheckOutTime(checkInDate, blockedDates);
    }, [checkInDate, blockedDates]);

    const earliestCheckInTime = latestCheckOutTime ? addOneHour(latestCheckOutTime) : "00:00";

    const filteredCheckInTimeOptions = useMemo(() => {
        return timeOptions.map(time => ({
            time,
            isBlocked: time < earliestCheckInTime,
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
                fullyBlockedDates.push(current);
                current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
            }
            
            if (!range.is_manual && range.end_time) {
                const checkOutDay = startOfDay(end);
                
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

        // Se for totalmente bloqueada E NÃO for um dia de check-out, desabilita.
        // Se for um dia de check-out (partialBlock), permitimos a seleção, pois o bloqueio é apenas de horário.
        if (isFullyBlocked && !isPartialBlock) {
            return true;
        }
        
        // Se for um dia de check-out (partialBlock), permitimos a seleção.
        // Se não for bloqueada, também permitimos.
        return false;
    };
    
    // Validação de horário de check-in
    useEffect(() => {
        if (checkInDate && latestCheckOutTime && checkInTime) {
            if (checkInTime < earliestCheckInTime) {
                form.setError("check_in_time", {
                    type: "manual",
                    message: `O check-in só é permitido após as ${latestCheckOutTime} (ou seja, a partir das ${earliestCheckInTime}) devido à limpeza.`,
                });
            } else {
                form.clearErrors("check_in_time");
            }
        } else if (checkInDate && latestCheckOutTime && checkInTime === DEFAULT_CHECK_IN_TIME) {
            if (DEFAULT_CHECK_IN_TIME < earliestCheckInTime) {
                form.setError("check_in_time", {
                    type: "manual",
                    message: `O horário padrão de check-in (${DEFAULT_CHECK_IN_TIME}) está bloqueado. Selecione um horário a partir das ${earliestCheckInTime}.`,
                });
            }
        } else {
            form.clearErrors("check_in_time");
        }
    }, [checkInDate, latestCheckOutTime, checkInTime, form, earliestCheckInTime]);


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
        timeOptions,
        DEFAULT_CHECK_IN_TIME,
        DEFAULT_CHECK_OUT_TIME,
        isDateFullyBlocked: (date: Date) => isDateFullyBlocked(date, blockedDates || []),
    };
};