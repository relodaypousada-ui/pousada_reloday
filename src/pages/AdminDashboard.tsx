import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Home, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8">Painel Administrativo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Novas reservas aguardando confirmação.</p>
            <Link to="/admin/reservas" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Ver Reservas <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acomodações</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Total de unidades cadastradas.</p>
            <Link to="/admin/acomodacoes" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Gerenciar <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">Hóspedes cadastrados no sistema.</p>
            <Link to="/admin/clientes" className="text-sm text-primary hover:underline mt-2 flex items-center">
                Ver Clientes <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="flex flex-wrap gap-4">
            <Button asChild variant="secondary">
                <Link to="/admin/reservas">
                    <Calendar className="mr-2 h-4 w-4" /> Gerenciar Reservas
                </Link>
            </Button>
            <Button asChild variant="secondary">
                <Link to="/admin/config">
                    <Settings className="mr-2 h-4 w-4" /> Configurações do Site
                </Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;