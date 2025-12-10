import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export interface Slide {
  id: string;
  titulo: string;
  subtitulo: string | null;
  imagem_url: string;
  cta_label: string | null;
  cta_href: string | null;
  ordem: number;
  is_active: boolean;
}

// Tipagem para inserção/atualização
export type SlideInsert = Omit<Slide, 'id'>;
export type SlideUpdate = Partial<SlideInsert>;

// --- Query Hooks (Existente) ---

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
    queryKey: ["slides", "public"],
    queryFn: getSlides,
  });
};

// Função para buscar TODOS os slides (incluindo inativos) para o admin
const getAdminSlides = async (): Promise<Slide[]> => {
  const { data, error } = await supabase
    .from("slides")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao buscar slides para o admin:", error);
    throw new Error("Não foi possível carregar a lista de slides.");
  }
  return data as Slide[];
};

export const useAdminSlides = () => {
  return useQuery<Slide[], Error>({
    queryKey: ["slides", "admin"],
    queryFn: getAdminSlides,
  });
};

// --- Mutation Hooks (CRUD Admin) ---

// 1. Criar Slide
const createSlide = async (newSlide: SlideInsert): Promise<Slide> => {
  const { data, error } = await supabase
    .from("slides")
    .insert(newSlide)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar slide:", error);
    throw new Error(`Falha ao criar slide: ${error.message}`);
  }
  return data as Slide;
};

export const useCreateSlide = () => {
  const queryClient = useQueryClient();
  return useMutation<Slide, Error, SlideInsert>({
    mutationFn: createSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slides"] });
      showSuccess("Slide criado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 2. Atualizar Slide
interface UpdateSlideArgs {
    id: string;
    updates: SlideUpdate;
}

const updateSlide = async ({ id, updates }: UpdateSlideArgs): Promise<Slide> => {
  const { data, error } = await supabase
    .from("slides")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // Adicionando log detalhado para depuração
    console.error(`Erro ao atualizar slide ID ${id}:`, error);
    
    // Se o erro for PGRST116 (No rows found), significa que o ID não existe ou RLS bloqueou.
    // Se for o erro de coerção, significa que mais de uma linha foi retornada (o que não deveria ocorrer com .eq('id', id)).
    // Mantemos o erro genérico para o usuário, mas o log ajuda na depuração.
    throw new Error(`Falha ao atualizar slide: ${error.message}. Verifique se o slide existe.`);
  }
  return data as Slide;
};

export const useUpdateSlide = () => {
  const queryClient = useQueryClient();
  return useMutation<Slide, Error, UpdateSlideArgs>({
    mutationFn: updateSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slides"] });
      showSuccess("Slide atualizado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 3. Deletar Slide
const deleteSlide = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("slides")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar slide:", error);
    throw new Error(`Falha ao deletar slide: ${error.message}`);
  }
};

export const useDeleteSlide = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteSlide,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slides"] });
      showSuccess("Slide deletado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};