import React from "react";
import { Reserva, useMyReservas } from "@/integrations/supabase/reservas";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CalendarCheck, Home, Users, DollarSign, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ReservaStatusBadge from "../admin/ReservaStatusBadge";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // IMPORT CORRIGIDO

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
};

interface ReservaCardProps {
    reserva: Reserva;
}

const ReservaCard: React.FC<ReservaCardProps> = ({ reserva }) => {
    const isUpcoming = new Date(reserva.check_in_date) >= new Date();
    
    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-primary/50">
            <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center">
                    <Home className="h-5 w-5 mr-2 text-primary" />
                    {reserva.acomodacoes.titulo}
                </CardTitle>
                <ReservaStatusBadge status={reserva.status} />
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground flex items-center"><CalendarCheck className="h-3 w-3 mr-1" /> Check-in</span>
                        <span className="font-medium">{formatDate(reserva.check_in_date)} às {reserva.check_in_time}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground flex items-center"><CalendarCheck className="h-3 w-3 mr-1" /> Check-out</span>
                        <span className="font-medium">{formatDate(reserva.check_out_date)} às {reserva.check_out_time}</span>
                    </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground flex items-center">
                            <Users className="h-4 w-4 mr-1" /> {reserva.total_hospedes} Hóspedes
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-bold text-green-600 flex items-center">
                            <DollarSign className="h-5 w-5 mr-1" /> {formatCurrency(reserva.valor_total)}
                        </span>
                    </div>
                </div>
                
                {/* Ação de Cancelamento (Placeholder) */}
                {isUpcoming && reserva.status === 'pendente' && (
                    <div className="pt-2 text-right">
                        <Link to={`/acomodacoes/${reserva.acomodacoes.slug}`}>
                            <Button variant="link" className="h-auto p-0 text-sm">
                                Ver Detalhes da Acomodação <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                        </Link>
                        {/* Futuramente: Botão de Cancelar Reserva */}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};


const UserReservaList: React.FC = () => {
    const { user } = useAuth();
    const { data: reservas, isLoading, isError, error } = useMyReservas(user?.id);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-6 bg-destructive/10 border border-destructive rounded-lg">
                <p className="text-destructive font-medium">Erro ao carregar suas reservas:</p>
                <p className="text-sm text-destructive/90 mt-1">
                    {error.message}
                </p>
            </div>
        );
    }

    if (!reservas || reservas.length === 0) {
        return (
            <div className="text-center p-6 text-muted-foreground border rounded-lg bg-accent/50">
                <p className="font-semibold mb-2">Nenhuma reserva encontrada.</p>
                <p className="text-sm">Parece que você ainda não fez nenhuma reserva. Que tal começar agora?</p>
                <Link to="/reserva">
                    <Button variant="link" className="mt-2 p-0">Fazer uma Reserva</Button>
                </Link>
            </div>
        );
    }
    
    // Separa reservas futuras/ativas das concluídas/canceladas
    const now = new Date();
    const activeReservas = reservas.filter(r => new Date(r.check_out_date) >= now);
    const historyReservas = reservas.filter(r => new Date(r.check_out_date) < now || r.status === 'cancelada');

    return (
        <div className="space-y-8">
            {/* Reservas Ativas/Futuras */}
            <div>
                <h3 className="text-2xl font-bold mb-4">Próximas Estadias ({activeReservas.length})</h3>
                <div className="space-y-4">
                    {activeReservas.length > 0 ? (
                        activeReservas.map(reserva => (
                            <ReservaCard key={reserva.id} reserva={reserva} />
                        ))
                    ) : (
                        <p className="text-muted-foreground italic">Nenhuma reserva ativa ou futura.</p>
                    )}
                </div>
            </div>

            {/* Histórico de Reservas */}
            <div>
                <h3 className="text-2xl font-bold mb-4">Histórico ({historyReservas.length})</h3>
                <div className="space-y-4">
                    {historyReservas.length > 0 ? (
                        historyReservas.map(reserva => (
                            <ReservaCard key={reserva.id} reserva={reserva} />
                        ))
                    ) : (
                        <p className="text-muted-foreground italic">Nenhum histórico de reservas.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserReservaList;