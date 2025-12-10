import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AcomodacaoMidia } from "@/integrations/supabase/acomodacoes";
import { Button } from "@/components/ui/button";

interface ImageGalleryCarouselProps {
  images: AcomodacaoMidia[];
  title: string;
}

const ImageGalleryCarousel: React.FC<ImageGalleryCarouselProps> = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="text-muted-foreground italic p-4 border rounded-lg bg-accent/50">
        Nenhuma imagem adicional disponível.
      </div>
    );
  }
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const currentItem = images[currentIndex];

  return (
    <div className="relative w-full">
      <div className="h-[40vh] md:h-[50vh] overflow-hidden rounded-xl shadow-lg">
        {images.map((item, i) => (
            <div
                key={item.id}
                className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    i === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                )}
                aria-hidden={i !== currentIndex}
            >
                <img
                    src={item.url}
                    alt={`${title} - Imagem ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>
        ))}
      </div>

      {/* Controles de Navegação */}
      {images.length > 1 && (
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
            ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicadores */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para imagem ${i + 1}`}
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

export default ImageGalleryCarousel;