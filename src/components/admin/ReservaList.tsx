import React, { useState } from "react";
import { Reserva, useAdminReservas, useDeleteReserva } from "@/integrations/supabase/reservas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Trash2, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { showError } from "@/utils/toast";
import ReservaStatusBadge from "./ReservaStatusBadge";
import ReservaDetailsDialog from "./ReservaDetailsDialog";

const ReservaList: React.FC = () => {
  const { data: reservas, isLoading, isError, error } = useAdminReservas();
  const deleteMutation = useDeleteReserva();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(err.message);
        }
    });
  };
  
  const handleOpenDetails = (reserva: Reserva) => {
      setSelectedReserva(reserva);
      setIsDialogOpen(true);
  };

  const filteredReservas = reservas?.filter(reserva => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reserva.acomodacoes.titulo.toLowerCase().includes(searchLower) ||
      reserva.profiles.full_name?.toLowerCase().includes(searchLower) ||
      reserva.id.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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
        <p className="text-destructive font-medium">Erro ao carregar reservas:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por acomodação, hóspede ou ID..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {(!filteredReservas || filteredReservas.length === 0) ? (
        <div className="text-center p-6 text-muted-foreground">
          Nenhuma reserva encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Acomodação</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservas.map((reserva) => (
                <TableRow key={reserva.id}>
                  <TableCell className="text-xs text-muted-foreground">{reserva.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-medium">{reserva.acomodacoes.titulo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{reserva.profiles.full_name || "N/A"}</TableCell>
                  <TableCell className="text-sm">{formatDate(reserva.check_in_date)}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(reserva.valor_total)}</TableCell>
                  <TableCell className="text-center">
                    <ReservaStatusBadge status={reserva.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleOpenDetails(reserva)}
                        aria-label="Ver Detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" aria-label="Deletar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação removerá permanentemente a reserva #{reserva.id.substring(0, 8)}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(reserva.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Deletar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedReserva && (
          <ReservaDetailsDialog 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen} 
              reserva={selectedReserva} 
          />
      )}
    </>
  );
};

export default ReservaList;