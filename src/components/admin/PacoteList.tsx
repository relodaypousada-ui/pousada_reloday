import React from "react";
import { Pacote, useAdminPacotes, useDeletePacote } from "@/integrations/supabase/pacotes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

interface PacoteListProps {
    onEdit: (pacote: Pacote) => void;
}

const PacoteList: React.FC<PacoteListProps> = ({ onEdit }) => {
  const { data: pacotes, isLoading, isError, error } = useAdminPacotes();
  const deleteMutation = useDeletePacote();

  const handleDelete = (id: string, nome: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(`Falha ao deletar ${nome}: ${err.message}`);
        }
    });
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
        <p className="text-destructive font-medium">Erro ao carregar pacotes:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!pacotes || pacotes.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhum pacote cadastrado. Clique em "Adicionar Pacote" para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pacotes.map((pacote) => (
            <TableRow key={pacote.id}>
              <TableCell className="font-medium">{pacote.nome}</TableCell>
              <TableCell>
                {pacote.categoria ? (
                    <Badge variant="secondary" className="capitalize">
                        <Tag className="h-3 w-3 mr-1" /> {pacote.categoria}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold text-green-600">
                {formatCurrency(pacote.valor)}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(pacote)}
                    aria-label="Editar"
                >
                  <Edit className="h-4 w-4" />
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
                        Esta ação removerá permanentemente o pacote "{pacote.nome}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(pacote.id, pacote.nome)}
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
  );
};

export default PacoteList;