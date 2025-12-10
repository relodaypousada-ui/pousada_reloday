import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slide } from "@/integrations/supabase/slides"; // Importando a tipagem correta

interface HeroCarouselProps {
  slides: Slide[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = [] }) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (slides.length === 0) return;

    // Autoplay simples (5s)
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => resetTimeout();
  }, [index, slides.length]);

  const handlePrev = () => {
    resetTimeout();
    setIndex((idx) => (idx - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    resetTimeout();
    setIndex((idx) => (idx + 1) % slides.length);
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[60vh] bg-gray-200 flex items-center justify-center">
        <p className="text-gray-600">Nenhum slide disponível.</p>
      </div>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[60vh] md:h-[70vh]">
        {slides.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
            aria-hidden={i !== index}
          >
            {/* Imagem com lazy loading */}
            <img
              src={s.image}
              alt={s.titulo}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Overlay de Conteúdo */}
            <div className="absolute inset-0 bg-black/40 flex items-center">
              <div className="container mx-auto px-4 text-white max-w-4xl text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">
                  {s.titulo}
                </h1>
                <p className="mt-4 text-lg md:text-xl font-light drop-shadow">
                  {s.subtitulo}
                </p>
                <div className="mt-8">
                  <Link to={s.ctaHref}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100 transition-transform transform hover:scale-[1.02]">
                      {s.ctaLabel}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Controles de Navegação */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Anterior"
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white h-10 w-10 rounded-full"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Próximo"
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 text-white h-10 w-10 rounded-full"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((s, i) => (
          <button
            key={s.id}
            aria-label={`Ir para slide ${i + 1}`}
            onClick={() => { resetTimeout(); setIndex(i); }}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              i === index ? "bg-white w-6" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;