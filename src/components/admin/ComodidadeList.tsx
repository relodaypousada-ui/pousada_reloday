import React from "react";
import { Comodidade } from "@/integrations/supabase/acomodacoes";
import { useAllComodidades, useDeleteComodidade } from "@/integrations/supabase/comodidades";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Check, X } from "lucide-react";
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
import * as LucideIcons from "lucide-react";

interface ComodidadeListProps {
    onEdit: (comodidade: Comodidade) => void;
}

// Helper para renderizar o ícone
const IconRenderer = ({ name }: { name: string | null }) => {
    if (!name) return <X className="h-4 w-4 text-muted-foreground" />;
    const LucideIcon = (LucideIcons as any)[name];
    return LucideIcon ? <LucideIcon className="h-4 w-4 text-primary" /> : <X className="h-4 w-4 text-destructive" />;
};


const ComodidadeList: React.FC<ComodidadeListProps> = ({ onEdit }) => {
  const { data: comodidades, isLoading, isError, error } = useAllComodidades();
  const deleteMutation = useDeleteComodidade();

  const handleDelete = (id: string, nome: string) => {
    deleteMutation.mutate(id, {
        onSuccess: () => {
            // O toast de sucesso é disparado no hook
        },
        onError: (err) => {
            showError(`Falha ao deletar ${nome}: ${err.message}`);
        }
    });
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
        <p className="text-destructive font-medium">Erro ao carregar comodidades:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!comodidades || comodidades.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhuma comodidade cadastrada. Clique em "Adicionar Comodidade" para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Ícone</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Nome do Ícone (Lucide)</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comodidades.map((comodidade) => (
            <TableRow key={comodidade.id}>
              <TableCell className="text-center">
                <IconRenderer name={comodidade.icone} />
              </TableCell>
              <TableCell className="font-medium">{comodidade.nome}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {comodidade.icone || "N/A"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(comodidade)}
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
                        Esta ação removerá permanentemente a comodidade "{comodidade.nome}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(comodidade.id, comodidade.nome)}
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

export default ComodidadeList;