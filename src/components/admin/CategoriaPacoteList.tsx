import React from "react";
import { CategoriaPacote, useAllCategoriasPacotes, useDeleteCategoriaPacote } from "@/integrations/supabase/categoriasPacotes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Tag } from "lucide-react";
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

interface CategoriaPacoteListProps {
    onEdit: (categoria: CategoriaPacote) => void;
}

const CategoriaPacoteList: React.FC<CategoriaPacoteListProps> = ({ onEdit }) => {
  const { data: categorias, isLoading, isError, error } = useAllCategoriasPacotes();
  const deleteMutation = useDeleteCategoriaPacote();

  const handleDelete = (id: string, nome: string) => {
    deleteMutation.mutate(id, {
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
        <p className="text-destructive font-medium">Erro ao carregar categorias:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhuma categoria cadastrada. Clique em "Adicionar Categoria" para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">#</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell className="text-center">
                <Tag className="h-4 w-4 text-muted-foreground" />
              </TableCell>
              <TableCell className="font-medium">{categoria.nome}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{categoria.slug}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(categoria)}
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
                        Esta ação removerá permanentemente a categoria "{categoria.nome}". Pacotes associados terão a categoria removida.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(categoria.id, categoria.nome)}
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

export default CategoriaPacoteList;