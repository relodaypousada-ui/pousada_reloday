import React from "react";
import { Acomodacao, useAdminAcomodacoes, useDeleteAcomodacao } from "@/integrations/supabase/acomodacoes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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

interface AcomodacaoListProps {
    onEdit: (acomodacao: Acomodacao) => void;
}

const AcomodacaoList: React.FC<AcomodacaoListProps> = ({ onEdit }) => {
  const { data: acomodacoes, isLoading, isError, error } = useAdminAcomodacoes();
  const deleteMutation = useDeleteAcomodacao();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(err.message);
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
        <p className="text-destructive font-medium">Erro ao carregar acomodações:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!acomodacoes || acomodacoes.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhuma acomodação cadastrada. Clique em "Adicionar Acomodação" para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Preço/Noite</TableHead>
            <TableHead className="text-center">Capacidade</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {acomodacoes.map((acomodacao) => (
            <TableRow key={acomodacao.id}>
              <TableCell className="font-medium">{acomodacao.titulo}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{acomodacao.slug}</TableCell>
              <TableCell className="text-right font-semibold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(acomodacao.preco)}
              </TableCell>
              <TableCell className="text-center">{acomodacao.capacidade}</TableCell>
              <TableCell className="text-center">
                {acomodacao.is_active ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Eye className="h-3 w-3 mr-1" /> Ativa
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3 mr-1" /> Inativa
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(acomodacao)}
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
                        Esta ação não pode ser desfeita. Isso removerá permanentemente a acomodação "{acomodacao.titulo}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(acomodacao.id)}
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

export default AcomodacaoList;