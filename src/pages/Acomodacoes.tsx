import React from "react";
import AcomodacaoCard from "@/components/AcomodacaoCard";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import { Loader2 } from "lucide-react";

const Acomodacoes: React.FC = () => {
  const { data: acomodacoes, isLoading, isError } = useAllAcomodacoes();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[40vh]">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }

    if (isError || !acomodacoes || acomodacoes.length === 0) {
      return (
        <div className="text-center p-10 border rounded-lg bg-muted/50">
          <h2 className="text-2xl font-semibold mb-2">Nenhuma Acomodação Encontrada</h2>
          <p className="text-muted-foreground">
            Parece que não há acomodações ativas cadastradas no momento.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {acomodacoes.map((acomodacao) => (
          <AcomodacaoCard key={acomodacao.id} acomodacao={acomodacao} />
        ))}
      </div>
    );
  };

  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-4">Todas as Acomodações</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Escolha a opção perfeita para a sua estadia e faça sua reserva.
      </p>
      
      {renderContent()}
    </div>
  );
};

export default Acomodacoes;