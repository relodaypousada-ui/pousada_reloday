import React, { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, CalendarCheck, Home, AlertTriangle } from "lucide-react";
import { useBlockedDates } from "@/integrations/supabase/reservas";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { parseISO, startOfDay, isBefore, isSameDay, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

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

const DashboardCalendar: React.FC = () => {
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
  
  // Seleciona a primeira acomodação para exibir no dashboard
  const firstAcomodacao = acomodacoes?.[0];
  const acomodacaoId = firstAcomodacao?.id;

  const { data: blockedDates, isLoading: isLoadingBlockedDates, isError } = useBlockedDates(acomodacaoId);

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

  if (isLoadingAcomodacoes || isLoadingBlockedDates) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!firstAcomodacao) {
      return (
        <div className="text-center p-6 text-muted-foreground flex flex-col items-center">
            <AlertTriangle className="h-6 w-6 mb-2 text-yellow-500" />
            Nenhuma acomodação cadastrada para exibir o calendário.
        </div>
      );
  }

  return (
    <div className="p-4 border rounded-xl bg-card shadow-sm w-full">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <CalendarCheck className="h-5 w-5 mr-2 text-primary" />
        Disponibilidade: {firstAcomodacao.titulo}
      </h3>
      {/* Removendo o div flex justify-center e aplicando w-full diretamente ao Calendar */}
      <Calendar
        mode="single"
        locale={ptBR}
        className="rounded-md border w-full" // Adicionando w-full aqui
        classNames={{
            // Sobrescreve a largura padrão do componente Calendar
            root: "w-full",
            months: "w-full flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4 w-full",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            // Adiciona bg-accent/30 à célula padrão
            cell: "h-9 w-full text-center text-sm p-0 relative bg-accent/30 [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-9 w-full p-0 font-normal aria-selected:opacity-100",
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
            ...calendarStyles, // Mantém os estilos de bloqueio
        }}
        modifiers={calendarModifiers}
        modifiersStyles={calendarStyles}
        // Desabilita a seleção, pois é apenas visualização
        disabled={() => true} 
      />
      <div className="mt-4 text-sm space-y-1">
        <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-destructive/20 border border-destructive"></span>
            <span className="text-muted-foreground">Totalmente Bloqueado (Noite de Reserva/Bloqueio)</span>
        </div>
        <div className="flex items-center">
            <span className="inline-block w-3 h-3 mr-2 rounded-full bg-yellow-500/20 border border-yellow-500"></span>
            <span className="text-muted-foreground">Parcialmente Bloqueado (Dia de Check-out)</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardCalendar;