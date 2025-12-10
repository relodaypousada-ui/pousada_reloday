import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft, CalendarOff, Home } from "lucide-react";
import BloqueioForm from "@/components/admin/BloqueioForm";
import BloqueioList from "@/components/admin/BloqueioList";
import BloqueioCalendar from "@/components/admin/BloqueioCalendar"; // Novo Import
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "@/components/ui/loader"; // Importando Loader2 do lucide-react

// Função para buscar TODOS os bloqueios manuais (Admin)
const getAllManualBlocksAdmin = async () => {
    const { data, error } = await supabase
        .from("bloqueios_manuais")
        .select("*")
        .order("data_inicio", { ascending: true });

    if (error) {
        throw new Error("Não foi possível carregar a lista de bloqueios manuais.");
    }
    return data;
};

const useAllManualBlocksAdmin = () => {
    return useQuery({
        queryKey: ["manualBlocks", "allAdmin"],
        queryFn: getAllManualBlocksAdmin,
    });
};

const AdminBloqueiosPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAcomodacaoId, setSelectedAcomodacaoId] = useState<string | undefined>(undefined);
  
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
  const { data: allBloqueios, isLoading: isLoadingAllBloqueios, error: allBloqueiosError } = useAllManualBlocksAdmin();
  
  // Criando um mapa de acomodações para facilitar a exibição na lista
  const acomodacoesMap = useMemo(() => {
      const map = new Map<string, string>();
      acomodacoes?.forEach(a => map.set(a.id, a.titulo));
      return map;
  }, [acomodacoes]);
  
  // Define a primeira acomodação como padrão se nenhuma estiver selecionada
  React.useEffect(() => {
      if (!selectedAcomodacaoId && acomodacoes && acomodacoes.length > 0) {
          setSelectedAcomodacaoId(acomodacoes[0].id);
      }
  }, [acomodacoes, selectedAcomodacaoId]);
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (isLoadingAcomodacoes) {
      return (
        <div className="w-full py-12 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Carregando acomodações...</p>
        </div>
      );
  }
  
  const currentAcomodacao = acomodacoes?.find(a => a.id === selectedAcomodacaoId);

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <CalendarOff className="h-8 w-8 mr-3 text-primary" />
        Bloqueio Manual de Datas
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Calendário e Seleção */}
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center">
                        <Home className="h-5 w-5 mr-2 text-muted-foreground" />
                        Visualizar Disponibilidade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <label className="text-sm font-medium leading-none">Selecione a Acomodação</label>
                        <Select 
                            value={selectedAcomodacaoId} 
                            onValueChange={setSelectedAcomodacaoId}
                            disabled={isLoadingAcomodacoes || !acomodacoes || acomodacoes.length === 0}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione uma acomodação para ver o calendário" />
                            </SelectTrigger>
                            <SelectContent>
                                {acomodacoes?.map((acomodacao) => (
                                    <SelectItem key={acomodacao.id} value={acomodacao.id}>
                                        {acomodacao.titulo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {selectedAcomodacaoId && currentAcomodacao ? (
                        <BloqueioCalendar acomodacaoId={selectedAcomodacaoId} />
                    ) : (
                        <div className="p-10 text-center text-muted-foreground border rounded-lg">
                            Selecione uma acomodação acima para visualizar o calendário de disponibilidade (reservas e bloqueios manuais).
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        
        {/* Coluna 2: Formulário e Lista de Bloqueios */}
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl">
                        {isFormOpen ? "Novo Bloqueio" : "Gerenciar Bloqueios"}
                    </CardTitle>
                    
                    {isFormOpen ? (
                        <Button variant="outline" onClick={handleCloseForm}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                        </Button>
                    ) : (
                        <Button onClick={() => setIsFormOpen(true)} disabled={isLoadingAcomodacoes || !acomodacoes || acomodacoes.length === 0}>
                            <PlusCircle className="h-4 w-4 mr-2" /> Bloquear Datas
                        </Button>
                    )}
                </CardHeader>
                
                <CardContent>
                    {isFormOpen ? (
                        <BloqueioForm onSuccess={handleCloseForm} />
                    ) : (
                        <BloqueioList 
                            bloqueios={allBloqueios || []} 
                            isLoading={isLoadingAllBloqueios} 
                            isError={!!allBloqueiosError}
                            error={allBloqueiosError}
                            acomodacoesMap={acomodacoesMap}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminBloqueiosPage;