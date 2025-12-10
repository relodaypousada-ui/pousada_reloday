import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Acomodacao {
  id: string;
  titulo: string;
  slug: string;
  descricao: string;
  capacidade: number;
  preco: number;
  imagem_url: string;
}

// Função para buscar todas as acomodações ativas
const getAllAcomodacoes = async (): Promise<Acomodacao[]> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .select("id, titulo, slug, descricao, capacidade, preco, imagem_url")
    .eq("is_active", true)
    .order("titulo", { ascending: true });

  if (error) {
    console.error("Erro ao buscar todas as acomodações:", error);
    throw new Error("Não foi possível carregar as acomodações.");
  }

  return data as Acomodacao[];
};

// Função para buscar acomodações em destaque (limitado a 3)
const getFeaturedAcomodacoes = async (): Promise<Acomodacao[]> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .select("id, titulo, slug, descricao, capacidade, preco, imagem_url")
    .eq("is_active", true)
    .limit(3)
    .order("created_at", { ascending: false }); // Exibe as 3 mais recentes

  if (error) {
    console.error("Erro ao buscar acomodações em destaque:", error);
    throw new Error("Não foi possível carregar as acomodações em destaque.");
  }

  return data as Acomodacao[];
};

export const useAllAcomodacoes = () => {
  return useQuery<Acomodacao[], Error>({
    queryKey: ["acomodacoes", "all"],
    queryFn: getAllAcomodacoes,
  });
};

export const useFeaturedAcomodacoes = () => {
  return useQuery<Acomodacao[], Error>({
    queryKey: ["acomodacoes", "featured"],
    queryFn: getFeaturedAcomodacoes,
  });
};