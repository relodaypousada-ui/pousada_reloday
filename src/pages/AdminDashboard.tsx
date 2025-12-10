import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, Home, Calendar } from "lucide-react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-8 border-b pb-4">Painel Administrativo</h1>
      
      <p className="text-lg text-muted-foreground mb-8">
        Bem-vindo à área de gestão da Pousada Reloday.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Pendentes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Novas reservas aguardando confirmação.</p>
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
          </CardContent>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="flex space-x-4">
            <Button variant="secondary">
                <Calendar className="mr-2 h-4 w-4" /> Gerenciar Calendário
            </Button>
            <Button variant="secondary">
                <Settings className="mr-2 h-4 w-4" /> Configurações do Site
            </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;