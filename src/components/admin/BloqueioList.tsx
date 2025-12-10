import React from "react";
import { BloqueioManual, useDeleteManualBlock } from "@/integrations/supabase/reservas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, CalendarOff, Home } from "lucide-react";
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
import { showError } from "@/utils/toast";

interface BloqueioListProps {
    bloqueios: BloqueioManual[];
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    acomodacoesMap: Map<string, string>; // Map<acomodacao_id, titulo>
}

const BloqueioList: React.FC<BloqueioListProps> = ({ bloqueios, isLoading, isError, error, acomodacoesMap }) => {
  const deleteMutation = useDeleteManualBlock();

  const handleDelete = (id: string, motivo: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(`Falha ao remover bloqueio (${motivo}): ${err.message}`);
        }
    });
  };
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
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
        <p className="text-destructive font-medium">Erro ao carregar bloqueios:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error?.message}
        </p>
      </div>
    );
  }

  if (!bloqueios || bloqueios.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhum bloqueio manual de datas cadastrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Acomodação</TableHead>
            <TableHead>Início</TableHead>
            <TableHead>Fim</TableHead>
            <TableHead>Motivo</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bloqueios.map((bloqueio) => (
            <TableRow key={bloqueio.id}>
              <TableCell className="font-medium flex items-center">
                <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                {acomodacoesMap.get(bloqueio.acomodacao_id) || "Acomodação Desconhecida"}
              </TableCell>
              <TableCell className="text-sm">{formatDate(bloqueio.data_inicio)}</TableCell>
              <TableCell className="text-sm">{formatDate(bloqueio.data_fim)}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {bloqueio.motivo || "N/A"}
              </TableCell>
              <TableCell className="text-right">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" aria-label="Deletar Bloqueio">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Bloqueio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação removerá o bloqueio de datas de {formatDate(bloqueio.data_inicio)} a {formatDate(bloqueio.data_fim)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(bloqueio.id, bloqueio.motivo || 'Bloqueio')}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Remover"}
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
  );
};

export default BloqueioList;