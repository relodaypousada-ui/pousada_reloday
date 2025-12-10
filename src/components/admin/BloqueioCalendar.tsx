import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { useBlockedDates } from "@/integrations/supabase/reservas";
import { parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BloqueioCalendarProps {
  acomodacaoId: string;
}

const BloqueioCalendar: React.FC<BloqueioCalendarProps> = ({ acomodacaoId }) => {
  const { data: blockedRanges, isLoading, isError } = useBlockedDates(acomodacaoId);

  // Mapeia os intervalos bloqueados para o formato que o react-day-picker entende
  const blockedModifiers = useMemo(() => {
    if (!blockedRanges) return [];

    return blockedRanges.map(range => {
      const start = parseISO(range.start);
      const end = parseISO(range.end);
      
      // O intervalo deve incluir o dia de check-in (start) mas excluir o dia de check-out (end)
      // para refletir a lógica de reserva (check-out é o dia que a acomodação fica livre).
      // Usamos endOfDay no dia anterior ao check-out para garantir que o dia de check-out não seja marcado.
      const intervalEnd = endOfDay(new Date(end.getTime() - 24 * 60 * 60 * 1000));

      return {
        from: startOfDay(start),
        to: intervalEnd,
      };
    });
  }, [blockedRanges]);

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
        modifiers={{
          blocked: blockedModifiers,
        }}
        modifiersStyles={{
          blocked: { 
            backgroundColor: 'hsl(var(--destructive) / 0.1)', // Cor de fundo suave
            color: 'hsl(var(--destructive))', // Cor do texto
            borderRadius: '0', // Remove bordas arredondadas para intervalos
          },
        }}
        // Renderiza o calendário sem seleção, apenas para visualização
      />
      <div className="mt-4 text-sm text-muted-foreground">
        <span className="inline-block w-3 h-3 mr-2 rounded-full bg-destructive/20 border border-destructive"></span>
        Datas Bloqueadas (Reservas Confirmadas/Pendentes ou Bloqueios Manuais)
      </div>
    </div>
  );
};

export default BloqueioCalendar;