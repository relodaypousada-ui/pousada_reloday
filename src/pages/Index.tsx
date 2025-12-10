import React from "react";
import HeroCarousel from "@/components/HeroCarousel";
import AcomodacaoCard from "@/components/AcomodacaoCard";
import { Button } from "@/components/ui/button";
import { Utensils, Wifi, Sun, MapPin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSlides } from "@/integrations/supabase/slides";
import { useFeaturedAcomodacoes } from "@/integrations/supabase/acomodacoes"; // Importando o hook de destaque

// --- Dados Mockados para Demonstração (Serviços mantidos por enquanto) ---

const mockServicos = [
    { icon: Utensils, title: "Café da Manã Gourmet", description: "Incluso na diária, com produtos frescos e regionais." },
    { icon: Wifi, title: "Wi-Fi de Alta Velocidade", description: "Conexão gratuita em todas as áreas da pousada." },
    { icon: Sun, title: "Piscina e Solarium", description: "Área de lazer completa para seu relaxamento." },
    { icon: MapPin, title: "Localização Privilegiada", description: "Próximo aos principais pontos turísticos da região." },
];

// --- Componente Principal ---

const Index: React.FC = () => {
  const { data: slides, isLoading: isLoadingSlides, isError: isErrorSlides } = useSlides();
  const { data: acomodacoes, isLoading: isLoadingAcomodacoes, isError: isErrorAcomodacoes } = useFeaturedAcomodacoes();

  const renderHero = () => {
    if (isLoadingSlides) {
      return (
        <div className="w-full h-[60vh] md:h-[70vh] bg-gray-100 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      );
    }

    if (isErrorSlides || !slides || slides.length === 0) {
      // Fallback visual se houver erro ou nenhum slide
      return (
        <div className="w-full h-[60vh] md:h-[70vh] bg-red-50 flex items-center justify-center">
          <p className="text-red-600">Erro ao carregar o carrossel. Verifique a conexão com o Supabase e a tabela 'slides'.</p>
        </div>
      );
    }

    return <HeroCarousel slides={slides} />;
  };

  const renderAcomodacoes = () => {
    if (isLoadingAcomodacoes) {
      return (
        <div className="col-span-full flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isErrorAcomodacoes || !acomodacoes || acomodacoes.length === 0) {
      return (
        <div className="col-span-full text-center text-muted-foreground p-10 border rounded-lg">
          Nenhuma acomodação em destaque encontrada.
        </div>
      );
    }

    return acomodacoes.map((acomodacao) => (
      <AcomodacaoCard key={acomodacao.id} acomodacao={acomodacao} />
    ));
  };

  return (
    <div className="w-full">
      {/* 1. Hero Carousel */}
      {renderHero()}

      {/* 2. Chamada para Ação de Reserva */}
      <section className="bg-secondary py-12">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-secondary-foreground">
            Pronto para a sua próxima viagem?
          </h2>
          <p className="mt-2 text-lg text-secondary-foreground/90">
            Garanta as melhores datas e tarifas.
          </p>
          <Link to="/reserva">
            <Button size="lg" className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
              Verificar Disponibilidade
            </Button>
          </Link>
        </div>
      </section>

      {/* 3. Destaques de Serviços */}
      <section className="container py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Nossos Serviços e Diferenciais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mockServicos.map((service, index) => (
            <div key={index} className="text-center p-6 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <service.icon className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Acomodações em Destaque */}
      <section className="bg-gray-50 py-16">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-12">Conheça Nossas Acomodações</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {renderAcomodacoes()}
          </div>
          <div className="text-center mt-12">
            <Link to="/acomodacoes">
                <Button variant="outline" size="lg">
                    Ver Todas as Acomodações
                </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* 5. Placeholder para Blog Preview, Galeria, Depoimentos, etc. */}
      <section className="container py-16">
        <h2 className="text-4xl font-bold text-center mb-12">O que dizem nossos hóspedes</h2>
        <div className="h-40 bg-purple-50 flex items-center justify-center rounded-lg border border-purple-200">
            Placeholder: Carrossel de Depoimentos
        </div>
      </section>
    </div>
  );
};

export default Index;