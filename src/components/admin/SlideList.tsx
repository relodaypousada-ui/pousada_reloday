import React from "react";
import { Slide, useAdminSlides, useDeleteSlide } from "@/integrations/supabase/slides";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Eye, EyeOff, Image } from "lucide-react";
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

interface SlideListProps {
    onEdit: (slide: Slide) => void;
}

const SlideList: React.FC<SlideListProps> = ({ onEdit }) => {
  const { data: slides, isLoading, isError, error } = useAdminSlides();
  const deleteMutation = useDeleteSlide();

  const handleDelete = (id: string, titulo: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(`Falha ao deletar ${titulo}: ${err.message}`);
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
        <p className="text-destructive font-medium">Erro ao carregar slides:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        Nenhum slide cadastrado. Clique em "Adicionar Slide" para começar.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Ordem</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>CTA</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {slides.map((slide) => (
            <TableRow key={slide.id}>
              <TableCell className="font-bold text-center">{slide.ordem}</TableCell>
              <TableCell className="font-medium flex items-center">
                <Image className="h-4 w-4 mr-2 text-muted-foreground" />
                {slide.titulo}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {slide.cta_label || "N/A"}
              </TableCell>
              <TableCell className="text-center">
                {slide.is_active ? (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    <Eye className="h-3 w-3 mr-1" /> Ativo
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <EyeOff className="h-3 w-3 mr-1" /> Inativo
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => onEdit(slide)}
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
                        Esta ação removerá permanentemente o slide "{slide.titulo}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => handleDelete(slide.id, slide.titulo)}
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

export default SlideList;