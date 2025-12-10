import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import AcomodacaoList from "@/components/admin/AcomodacaoList";
import AcomodacaoForm from "@/components/admin/AcomodacaoForm";
import { Acomodacao } from "@/integrations/supabase/acomodacoes";

const AdminAcomodacoesPage: React.FC = () => {
  const [editingAcomodacao, setEditingAcomodacao] = useState<Acomodacao | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingAcomodacao(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (acomodacao: Acomodacao) => {
    setEditingAcomodacao(acomodacao);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAcomodacao(undefined);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8">Gerenciamento de Acomodações</h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isFormOpen 
                ? (editingAcomodacao ? "Editar Acomodação" : "Nova Acomodação")
                : "Lista de Acomodações"
            }
          </CardTitle>
          
          {isFormOpen ? (
            <Button variant="outline" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Lista
            </Button>
          ) : (
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Acomodação
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {isFormOpen ? (
            <AcomodacaoForm 
                initialData={editingAcomodacao} 
                onSuccess={handleCloseForm} 
            />
          ) : (
            <AcomodacaoList onEdit={handleOpenEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAcomodacoesPage;