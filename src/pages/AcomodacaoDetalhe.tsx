import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAcomodacaoBySlug } from "@/integrations/supabase/acomodacoes";
import { Loader2, Users, DollarSign, ArrowLeft, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AmenityList from "@/components/AmenityList";
import ImageGalleryCarousel from "@/components/ImageGalleryCarousel"; // Novo Import
import VideoCard from "@/components/VideoCard"; // Novo Import

const AcomodacaoDetalhe: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: acomodacao, isLoading, isError } = useAcomodacaoBySlug(slug);

  if (isLoading) {
    return (
      <div className="container py-12 min-h-[60vh] flex justify-center items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !acomodacao) {
    return (
      <div className="container py-12 min-h-[60vh] text-center">
        <h1 className="text-4xl font-bold mb-4">Acomodação Não Encontrada</h1>
        <p className="text-lg text-muted-foreground mb-6">
          A acomodação que você está procurando pode ter sido removida ou o link está incorreto.
        </p>
        <Link to="/acomodacoes">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Acomodações
          </Button>
        </Link>
      </div>
    );
  }

  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(acomodacao.preco);
  
  // 1. Filtrar e separar as mídias
  const additionalImages = (acomodacao.midia || [])
    .filter(m => m.tipo === 'image')
    .sort((a, b) => a.ordem - b.ordem);
    
  const videos = (acomodacao.midia || [])
    .filter(m => m.tipo === 'video')
    .sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="w-full">
      {/* 1. Banner Principal (Imagem Principal) */}
      <div className="w-full h-[50vh] md:h-[60vh] overflow-hidden relative">
        {acomodacao.imagem_url ? (
            <img
                src={acomodacao.imagem_url}
                alt={acomodacao.titulo}
                className="w-full h-full object-cover"
                loading="eager"
            />
        ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <ImageOff className="h-12 w-12 text-gray-500" />
            </div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="container py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Coluna Principal: Detalhes e Descrição */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <h1 className="text-4xl font-extrabold mb-4 md:mb-0">{acomodacao.titulo}</h1>
            <div className="flex items-center space-x-6 text-lg">
                <div className="flex items-center text-primary font-semibold">
                <Users className="h-5 w-5 mr-2" />
                <span>Capacidade: {acomodacao.capacidade} Hóspedes</span>
                </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-3xl font-bold mb-4">Sobre a Acomodação</h2>
            <p className="text-lg text-muted-foreground whitespace-pre-line">
              {acomodacao.descricao || "Nenhuma descrição detalhada fornecida para esta acomodação."}
            </p>
          </div>

          {/* 2. Carrossel de Imagens Adicionais */}
          <div className="pt-4">
            <h2 className="text-3xl font-bold mb-4">Galeria de Fotos</h2>
            <ImageGalleryCarousel images={additionalImages} title={acomodacao.titulo} />
          </div>
          
          {/* 3. Vídeos Adicionais */}
          {videos.length > 0 && (
            <div className="pt-4">
              <h2 className="text-3xl font-bold mb-4">Vídeos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video, index) => (
                  <VideoCard key={video.id} media={video} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Comodidades */}
          <div className="pt-4">
            <h2 className="text-3xl font-bold mb-4">Comodidades Inclusas</h2>
            <AmenityList comodidades={acomodacao.comodidades || []} />
          </div>
        </div>

        {/* Coluna Lateral: Reserva Rápida */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 border rounded-xl shadow-lg bg-card">
            <h3 className="text-2xl font-bold mb-4">Reserve Agora</h3>
            <p className="text-3xl font-extrabold text-primary mb-6">
              {precoFormatado} <span className="text-base font-normal text-muted-foreground">/ noite</span>
            </p>
            
            {/* Placeholder para Formulário de Datas */}
            <div className="space-y-4 mb-6">
                <div className="h-12 bg-accent rounded flex items-center justify-center text-sm text-accent-foreground">
                    Seletor de Datas (Check-in/Check-out)
                </div>
                <div className="h-12 bg-accent rounded flex items-center justify-center text-sm text-accent-foreground">
                    Seletor de Hóspedes
                </div>
            </div>

            <Link to="/reserva">
              <Button size="lg" className="w-full">
                Confirmar Reserva
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3 text-center">
                Você será redirecionado para o formulário de reserva completo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcomodacaoDetalhe;