import React from "react";
import HeroCarousel from "@/components/HeroCarousel";
import AcomodacaoCard from "@/components/AcomodacaoCard";
import { Button } from "@/components/ui/button";
import { Utensils, Wifi, Sun, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// --- Dados Mockados para Demonstração ---

const mockSlides = [
  {
    id: "s1",
    image: "https://via.placeholder.com/1920x1080/4682B4/FFFFFF?text=Vista+Panor%C3%A2mica",
    titulo: "Pousada Reloday: Seu Refúgio de Paz",
    subtitulo: "Descubra o conforto e a tranquilidade em meio à natureza.",
    ctaLabel: "Ver Acomodações",
    ctaHref: "/acomodacoes",
    alt: "Vista panorâmica da pousada",
  },
  {
    id: "s2",
    image: "https://via.placeholder.com/1920x1080/20B2AA/FFFFFF?text=Piscina+e+%C3%81rea+de+Lazer",
    titulo: "Relaxe em Nossa Piscina Exclusiva",
    subtitulo: "Momentos inesquecíveis sob o sol.",
    ctaLabel: "Reservar Agora",
    ctaHref: "/reserva",
    alt: "Piscina da pousada",
  },
];

const mockAcomodacoes = [
  {
    id: "a1",
    titulo: "Suíte Master Luxo",
    slug: "suite-master-luxo",
    descricao: "Acomodação espaçosa com vista privilegiada, ideal para casais que buscam exclusividade e conforto.",
    capacidade: 2,
    preco: 450.00,
    imagem: "https://via.placeholder.com/600x400/87CEFA/FFFFFF?text=Su%C3%ADte+Master",
  },
  {
    id: "a2",
    titulo: "Chalé Família",
    slug: "chale-familia",
    descricao: "Perfeito para famílias, com dois quartos e cozinha compacta. Sinta-se em casa!",
    capacidade: 4,
    preco: 320.00,
    imagem: "https://via.placeholder.com/600x400/F08080/FFFFFF?text=Chal%C3%A9+Fam%C3%ADlia",
  },
  {
    id: "a3",
    titulo: "Quarto Standard",
    slug: "quarto-standard",
    descricao: "Opção econômica e confortável para estadias curtas. Cama queen e banheiro privativo.",
    capacidade: 2,
    preco: 190.00,
    imagem: "https://via.placeholder.com/600x400/90EE90/FFFFFF?text=Quarto+Standard",
  },
];

const mockServicos = [
    { icon: Utensils, title: "Café da Manhã Gourmet", description: "Incluso na diária, com produtos frescos e regionais." },
    { icon: Wifi, title: "Wi-Fi de Alta Velocidade", description: "Conexão gratuita em todas as áreas da pousada." },
    { icon: Sun, title: "Piscina e Solarium", description: "Área de lazer completa para seu relaxamento." },
    { icon: MapPin, title: "Localização Privilegiada", description: "Próximo aos principais pontos turísticos da região." },
];

// --- Componente Principal ---

const Index: React.FC = () => {
  return (
    <div className="w-full">
      {/* 1. Hero Carousel */}
      <HeroCarousel slides={mockSlides} />

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
            {mockAcomodacoes.map((acomodacao) => (
              <AcomodacaoCard key={acomodacao.id} acomodacao={acomodacao} />
            ))}
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