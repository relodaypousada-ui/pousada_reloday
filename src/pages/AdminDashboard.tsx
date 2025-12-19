import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Home, Calendar, ArrowRight, Loader2, Gift, ListChecks, CalendarOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useCountPendingReservas, useCountAcomodacoes, useCountProfiles, useCountPacotes, useCountComodidades } from "@/integrations/supabase/dashboard";
import DashboardCalendar from "@/components/admin/DashboardCalendar";

const AdminDashboard: React.FC = () => {
  const { data: pendingReservasCount, isLoading: isLoadingReservas } = useCountPendingReservas();
  const { data: acomodacoesCount, isLoading: isLoadingAcomodacoes } = useCountAcomodacoes();
  const { data: profilesCount, isLoading: isLoadingProfiles } = useCountProfiles();
  const { data: pacotesCount, isLoading: isLoadingPacotes } = useCountPacotes();
  const { data: comodidadesCount, isLoading: isLoadingComodidades } = useCountComodidades();
  
  const isLoading = isLoadingReservas || isLoadingAcomodacoes || isLoadingProfiles || isLoadingPacotes || isLoadingComodidades;

  const renderCount = (count: number | undefined, loading: boolean) => {
      if (loading) {
          return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
      }
      return <div className="text-2xl font-bold">{count ?? 0}</div>;
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8">Painel Administrativo</h1>
      
      {/* Linha de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Card: Reservas Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCount(pendingReservasCount, isLoadingReservas)}
            <p className="text-xs text-muted-foreground">Novas reservas aguardando confirmação.</p>
            <Link to="/admin/reservas" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Ver Reservas <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        {/* Card: Acomodações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acomodações</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCount(acomodacoesCount, isLoadingAcomodacoes)}
            <p className="text-xs text-muted-foreground">Total de unidades cadastradas.</p>
            <Link to="/admin/acomodacoes" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Gerenciar <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
        
        {/* Card: Pacotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacotes</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCount(pacotesCount, isLoadingPacotes)}
            <p className="text-xs text-muted-foreground">Ofertas e experiências.</p>
            <Link to="/admin/pacotes" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Gerenciar <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
        
        {/* Card: Comodidades */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comodidades</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCount(comodidadesCount, isLoadingComodidades)}
            <p className="text-xs text-muted-foreground">Itens de conforto e serviços.</p>
            <Link to="/admin/comodidades" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Gerenciar <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        {/* Card: Usuários Registrados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {renderCount(profilesCount, isLoadingProfiles)}
            <p className="text-xs text-muted-foreground">Hóspedes cadastrados no sistema.</p>
            <Link to="/admin/clientes" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Ver Clientes <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {/* Calendário de Disponibilidade (Primeira Acomodação) */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <DashboardCalendar />
        </div>
        
        {/* Ações Rápidas */}
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Button asChild variant="secondary" className="w-full justify-start">
                        <Link to="/admin/reservas">
                            <Calendar className="mr-2 h-4 w-4" /> Gerenciar Reservas
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full justify-start">
                        <Link to="/admin/bloqueios">
                            <CalendarOff className="mr-2 h-4 w-4" /> Bloqueios Manuais
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full justify-start">
                        <Link to="/admin/config">
                            <Settings className="mr-2 h-4 w-4" /> Configurações do Site
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;