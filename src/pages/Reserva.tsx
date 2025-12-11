import React from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAllAcomodacoes } from "@/integrations/supabase/acomodacoes";
import ReservaForm from "@/components/reserva/ReservaForm";
import { Loader2 } from "lucide-react";

const Reserva: React.FC = () => {
  const [searchParams] = useSearchParams();
  const acomodacaoSlug = searchParams.get('acomodacao_slug');
  
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes } = useAllAcomodacoes();
  
  // Encontra o ID da acomodação se o slug estiver presente
  const initialAcomodacaoId = React.useMemo(() => {
      if (acomodacaoSlug && acomodacoes) {
          return acomodacoes.find(a => a.slug === acomodacaoSlug)?.id;
      }
      return undefined;
  }, [acomodacaoSlug, acomodacoes]);

  if (isLoadingAcomodacoes) {
    return (
      <div className="container py-12 min-h-[60vh] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 min-h-[60vh] flex justify-center">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Fazer Sua Reserva</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os detalhes para solicitar sua estadia.
          </p>
        </CardHeader>
        <CardContent>
          <ReservaForm initialAcomodacaoId={initialAcomodacaoId} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reserva;