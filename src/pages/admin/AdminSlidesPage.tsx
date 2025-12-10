import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, Image } from "lucide-react";
import SlideList from "@/components/admin/SlideList";
import SlideForm from "@/components/admin/SlideForm";
import { Slide } from "@/integrations/supabase/slides";

const AdminSlidesPage: React.FC = () => {
  const [editingSlide, setEditingSlide] = useState<Slide | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingSlide(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingSlide(undefined);
  };

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Image className="h-8 w-8 mr-3 text-primary" />
        Gerenciamento de Slides do Carrossel
      </h1>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">
            {isFormOpen 
                ? (editingSlide ? "Editar Slide" : "Novo Slide")
                : "Lista de Slides"
            }
          </CardTitle>
          
          {isFormOpen ? (
            <Button variant="outline" onClick={handleCloseForm}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar à Lista
            </Button>
          ) : (
            <Button onClick={handleOpenCreate}>
              <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Slide
            </Button>
          )}
        </CardHeader>
        
        <CardContent>
          {isFormOpen ? (
            <SlideForm 
                initialData={editingSlide} 
                onSuccess={handleCloseForm} 
            />
          ) : (
            <SlideList onEdit={handleOpenEdit} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSlidesPage;