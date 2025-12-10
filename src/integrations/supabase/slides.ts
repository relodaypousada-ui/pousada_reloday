import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Slide {
  id: string;
  titulo: string;
  subtitulo: string;
  imagem_url: string;
  cta_label: string;
  cta_href: string;
  ordem: number;
}

const getSlides = async (): Promise<Slide[]> => {
  const { data, error } = await supabase
    .from("slides")
    .select("id, titulo, subtitulo, imagem_url, cta_label, cta_href, ordem")
    .eq("is_active", true)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao buscar slides:", error);
    throw new Error("Não foi possível carregar os slides.");
  }

  // Mapeia 'imagem_url' para 'image' e 'cta_label' para 'ctaLabel' para manter a compatibilidade com o componente HeroCarousel
  return data.map(slide => ({
    ...slide,
    image: slide.imagem_url,
    ctaLabel: slide.cta_label,
    ctaHref: slide.cta_href,
  })) as Slide[];
};

export const useSlides = () => {
  return useQuery<Slide[], Error>({
    queryKey: ["slides"],
    queryFn: getSlides,
  });
};