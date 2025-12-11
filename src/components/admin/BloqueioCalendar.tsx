import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { useBlockedDates, BlockedDateTime } from "@/integrations/supabase/reservas";
import { parseISO, startOfDay, isBefore, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BloqueioCalendarProps {
  acomodacaoId: string;
}

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

const BloqueioCalendar: React.FC<BloqueioCalendarProps> = ({ acomodacaoId }) => {
  const { data: blockedDates, isLoading, isError } = useBlockedDates(acomodacaoId);

  // 1. Modificadores para estilizar datas bloqueadas (vermelho) e parcialmente bloqueadas (amarelo)
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


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center p-4 text-destructive">
        Erro ao carregar a disponibilidade.
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-card shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Disponibilidade da Acomodação</h3>
      <Calendar
        mode="single"
        locale={ptBR}
        className="rounded-md border w-full"
        // Modificadores para destacar as datas bloqueadas
        modifiers={calendarModifiers}
        modifiersStyles={{
          blocked: { 
            backgroundColor: 'hsl(var(--destructive) / 0.1)', // Vermelho suave (Totalmente Bloqueado)
            color: 'hsl(var(--destructive))',
            borderRadius: '0',
          },
          partialBlock: {
            backgroundColor: 'hsl(40 80% 90%)', // Amarelo suave (Parcialmente Bloqueado)
            color: 'hsl(40 80% 40%)',
            border: '1px solid hsl(40 80% 70%)',
            borderRadius: '0',
          }
        }}
        // Renderiza o calendário sem seleção, apenas para visualização
      />
      <div className="mt-4 text-sm space-y-1">
        <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-destructive/20 border border-destructive"></span>
            <span className="text-muted-foreground">Datas Totalmente Bloqueadas (Noites de Reserva/Bloqueio Manual)</span>
        </div>
        <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-yellow-500/20 border border-yellow-500"></span>
            <span className="text-muted-foreground">Datas Parcialmente Bloqueadas (Dia de Check-out, disponível após o horário de saída)</span>
        </div>
      </div>
    </div>
  );
};

export default BloqueioCalendar;