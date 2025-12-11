import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, Users, DollarSign, Home, Clock } from "lucide-react";
import { Reserva, ReservaStatus, useUpdateReserva } from "@/integrations/supabase/reservas";
import ReservaStatusBadge from "./ReservaStatusBadge";
import { Link } from "react-router-dom";

interface ReservaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: Reserva;
}

// Schema de Validação (apenas para o status)
const formSchema = z.object({
  status: z.enum(["pendente", "confirmada", "cancelada", "concluida"]),
});

const statusOptions: { value: ReservaStatus, label: string }[] = [
    { value: "pendente", label: "Pendente" },
    { value: "confirmada", label: "Confirmada" },
    { value: "cancelada", label: "Cancelada" },
    { value: "concluida", label: "Concluída" },
];

const ReservaDetailsDialog: React.FC<ReservaDetailsDialogProps> = ({ open, onOpenChange, reserva }) => {
  const updateMutation = useUpdateReserva();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: reserva.status,
    },
  });
  
  // Sincroniza o status quando a reserva muda
  useEffect(() => {
      form.reset({ status: reserva.status });
  }, [reserva, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.status === reserva.status) {
        onOpenChange(false);
        return;
    }
    
    updateMutation.mutate({ id: reserva.id, updates: { status: values.status } }, {
        onSuccess: () => {
            onOpenChange(false);
        },
    });
  }
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric'
      });
  };
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes da Reserva #{reserva.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Gerencie o status e visualize os detalhes desta reserva.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            {/* Informações Principais */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status Atual:</span>
                    <ReservaStatusBadge status={reserva.status} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Criada em:</span>
                    <span className="text-sm">{formatDate(reserva.created_at)}</span>
                </div>
                <Separator />
                
                <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-primary" />
                    <span className="font-semibold">{reserva.acomodacoes.titulo}</span>
                    <Link to={`/acomodacoes/${reserva.acomodacoes.slug}`} target="_blank" className="text-xs text-blue-500 hover:underline">
                        (Ver Acomodação)
                    </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm">Hóspede: {reserva.profiles.full_name || "N/A"}</span>
                </div>
            </div>
            
            {/* Datas e Valores */}
            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1" /> Check-in</span>
                    <span className="font-bold text-lg">{formatDate(reserva.check_in_date)}</span>
                    <span className="text-sm font-medium flex items-center mt-1"><Clock className="h-3 w-3 mr-1" /> {reserva.check_in_time}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground flex items-center"><Calendar className="h-3 w-3 mr-1" /> Check-out</span>
                    <span className="font-bold text-lg">{formatDate(reserva.check_out_date)}</span>
                    <span className="text-sm font-medium flex items-center mt-1"><Clock className="h-3 w-3 mr-1" /> {reserva.check_out_time}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground flex items-center"><Users className="h-3 w-3 mr-1" /> Total Hóspedes</span>
                    <span className="font-bold text-lg">{reserva.total_hospedes}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground flex items-center"><DollarSign className="h-3 w-3 mr-1" /> Valor Total</span>
                    <span className="font-bold text-lg text-green-600">{formatCurrency(reserva.valor_total)}</span>
                </div>
            </div>

            <Separator />

            {/* Formulário de Atualização de Status */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Atualizar Status da Reserva</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um novo status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {statusOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={updateMutation.isPending || !form.formState.isDirty}
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            "Salvar Novo Status"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReservaDetailsDialog;