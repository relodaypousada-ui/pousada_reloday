import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Tags } from "lucide-react";
import CategoriaPacoteList from "@/components/admin/CategoriaPacoteList";
import CategoriaPacoteForm from "@/components/admin/CategoriaPacoteForm";
import { CategoriaPacote } from "@/integrations/supabase/categoriasPacotes";

const AdminCategoriasPacotesPage: React.FC = () => {
  const [editingCategoria, setEditingCategoria] = useState<CategoriaPacote | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingCategoria(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (categoria: CategoriaPacote) => {
    setEditingCategoria(categoria);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategoria(undefined);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Tags className="h-8 w-8 mr-3 text-primary" />
        Gerenciamento de Categorias de Pacotes
      </h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isFormOpen 
                ? (editingCategoria ? "Editar Categoria" : "Nova Categoria")
                : "Lista de Categorias"
            }
          </CardTitle>
          
          {isFormOpen ? (
            <Button variant="outline" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Lista
            </Button>
          ) : (
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Categoria
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {isFormOpen ? (
            <CategoriaPacoteForm 
                initialData={editingCategoria} 
                onSuccess={handleCloseForm} 
            />
          ) : (
            <CategoriaPacoteList onEdit={handleOpenEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCategoriasPacotesPage;