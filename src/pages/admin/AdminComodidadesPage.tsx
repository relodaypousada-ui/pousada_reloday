import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Settings } from "lucide-react";
import ComodidadeList from "@/components/admin/ComodidadeList";
import ComodidadeForm from "@/components/admin/ComodidadeForm";
import { Comodidade } from "@/integrations/supabase/acomodacoes";

const AdminComodidadesPage: React.FC = () => {
  const [editingComodidade, setEditingComodidade] = useState<Comodidade | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingComodidade(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (comodidade: Comodidade) => {
    setEditingComodidade(comodidade);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingComodidade(undefined);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Settings className="h-8 w-8 mr-3 text-primary" />
        Gerenciamento de Comodidades
      </h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isFormOpen 
                ? (editingComodidade ? "Editar Comodidade" : "Nova Comodidade")
                : "Lista de Comodidades"
            }
          </CardTitle>
          
          {isFormOpen ? (
            <Button variant="outline" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Lista
            </Button>
          ) : (
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Comodidade
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {isFormOpen ? (
            <ComodidadeForm 
                initialData={editingComodidade} 
                onSuccess={handleCloseForm} 
            />
          ) : (
            <ComodidadeList onEdit={handleOpenEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminComodidadesPage;