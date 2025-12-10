import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  billing_address: string | null;
  is_admin: boolean | null;
  updated_at: string | null;
}

// Função para buscar todos os perfis (requer permissão de administrador via RLS)
const getAllProfiles = async (): Promise<Profile[]> => {
  // O RLS garantirá que apenas administradores possam executar esta query com sucesso.
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar todos os perfis:", error);
    // Se o erro for de permissão (RLS), o erro será lançado aqui.
    throw new Error("Não foi possível carregar a lista de usuários. Verifique suas permissões.");
  }

  return data as Profile[];
};

export const useAllProfiles = () => {
  return useQuery<Profile[], Error>({
    queryKey: ["adminProfiles"],
    queryFn: getAllProfiles,
  });
};

// Função para buscar o perfil do usuário logado
const getMyProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error("Erro ao buscar meu perfil:", error);
    throw new Error("Não foi possível carregar seu perfil.");
  }

  return data as Profile | null;
};

export const useMyProfile = (userId: string | undefined) => {
  return useQuery<Profile | null, Error>({
    queryKey: ["myProfile", userId],
    queryFn: () => getMyProfile(userId!),
    enabled: !!userId,
  });
};