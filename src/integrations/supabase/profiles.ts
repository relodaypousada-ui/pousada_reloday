import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  billing_address: string | null;
  is_admin: boolean | null;
  updated_at: string | null;
}

// Tipagem para os dados que podem ser atualizados
export type ProfileUpdate = {
  full_name: string;
  billing_address: string;
};

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

// Função de mutação para atualizar o perfil
interface UpdateProfileArgs {
    userId: string;
    updates: ProfileUpdate;
}

const updateProfile = async ({ userId, updates }: UpdateProfileArgs): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    throw new Error("Não foi possível salvar as alterações do perfil.");
  }

  return data as Profile;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<Profile, Error, UpdateProfileArgs>({
    mutationFn: updateProfile,
    onSuccess: (newProfile) => {
      // Invalida o cache para garantir que o perfil seja atualizado em toda a aplicação
      queryClient.invalidateQueries({ queryKey: ["myProfile", newProfile.id] });
    },
  });
};