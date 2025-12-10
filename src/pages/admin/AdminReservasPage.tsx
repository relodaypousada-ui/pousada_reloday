import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";
import ReservaList from "@/components/admin/ReservaList";

const AdminReservasPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <CalendarCheck className="h-8 w-8 mr-3 text-primary" />
        Gerenciamento de Reservas
      </h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Lista de Todas as Reservas
          </CardTitle>
          <p className="text-muted-foreground">Visualize, filtre e atualize o status das reservas dos hóspedes.</p>
        </CardHeader>
        
        <CardContent>
          <ReservaList />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReservasPage;