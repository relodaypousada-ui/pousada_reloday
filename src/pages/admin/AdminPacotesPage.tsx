import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Gift } from "lucide-react";
import PacoteList from "@/components/admin/PacoteList";
import PacoteForm from "@/components/admin/PacoteForm";
import { Pacote } from "@/integrations/supabase/pacotes";

const AdminPacotesPage: React.FC = () => {
  const [editingPacote, setEditingPacote] = useState<Pacote | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingPacote(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (pacote: Pacote) => {
    setEditingPacote(pacote);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPacote(undefined);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Gift className="h-8 w-8 mr-3 text-primary" />
        Gerenciamento de Pacotes
      </h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isFormOpen 
                ? (editingPacote ? "Editar Pacote" : "Novo Pacote")
                : "Lista de Pacotes"
            }
          </CardTitle>
          
          {isFormOpen ? (
            <Button variant="outline" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Lista
            </Button>
          ) : (
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Pacote
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {isFormOpen ? (
            <PacoteForm 
                initialData={editingPacote} 
                onSuccess={handleCloseForm} 
            />
          ) : (
            <PacoteList onEdit={handleOpenEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPacotesPage;