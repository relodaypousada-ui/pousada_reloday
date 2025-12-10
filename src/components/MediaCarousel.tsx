import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { AcomodacaoMidia } from "@/integrations/supabase/acomodacoes";
import { Button } from "@/components/ui/button";

interface MediaCarouselProps {
  media: AcomodacaoMidia[];
  mainImageUrl: string | null;
  title: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, mainImageUrl, title }) => {
  // Combina a imagem principal com a mídia adicional
  const allMedia: AcomodacaoMidia[] = [
    ...(mainImageUrl ? [{ id: 'main', url: mainImageUrl, tipo: 'image', ordem: -1 } as AcomodacaoMidia] : []),
    ...media,
  ].sort((a, b) => a.ordem - b.ordem);

  const [currentIndex, setCurrentIndex] = useState(0);

  if (allMedia.length === 0) {
    return (
      <div className="w-full h-[50vh] bg-gray-200 flex items-center justify-center rounded-lg">
        <p className="text-gray-600">Nenhuma mídia disponível.</p>
      </div>
    );
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length);
  };

  const currentItem = allMedia[currentIndex];

  return (
    <div className="relative w-full">
      <div className="h-[50vh] md:h-[60vh] overflow-hidden rounded-xl shadow-xl">
        {currentItem.tipo === 'image' ? (
          <img
            src={currentItem.url}
            alt={`${title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center relative">
            <Video className="h-12 w-12 text-white/50 absolute z-0" />
            {/* Placeholder para vídeo. Em um app real, usaríamos um player de vídeo. */}
            <iframe
              src={currentItem.url}
              title={`${title} - Vídeo`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full z-10"
            ></iframe>
          </div>
        )}
      </div>

      {/* Controles de Navegação */}
      {allMedia.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Anterior"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próximo"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white h-10 w-10 rounded-full"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicadores */}
      {allMedia.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {allMedia.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para mídia ${i + 1}`}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                i === currentIndex ? "bg-white w-6" : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;