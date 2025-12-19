import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export interface Pacote {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  categoria: string | null;
  created_at: string;
}

// Tipagem para inserção/atualização
export type PacoteInsert = Omit<Pacote, 'id' | 'created_at'>;
export type PacoteUpdate = Partial<PacoteInsert>;

// --- Query Hooks ---

// Função para buscar TODOS os pacotes (Admin)
const getAdminPacotes = async (): Promise<Pacote[]> => {
  const { data, error } = await supabase
    .from("pacotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pacotes para o admin:", error);
    throw new Error("Não foi possível carregar a lista de pacotes. Verifique suas permissões.");
  }
  return data as Pacote[];
};

export const useAdminPacotes = () => {
  return useQuery<Pacote[], Error>({
    queryKey: ["pacotes", "admin"],
    queryFn: getAdminPacotes,
  });
};

// --- Mutation Hooks (CRUD Admin) ---

// 1. Criar Pacote
const createPacote = async (newPacote: PacoteInsert): Promise<Pacote> => {
  const { data, error } = await supabase
    .from("pacotes")
    .insert(newPacote)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar pacote:", error);
    throw new Error(`Falha ao criar pacote: ${error.message}`);
  }
  return data as Pacote;
};

export const useCreatePacote = () => {
  const queryClient = useQueryClient();
  return useMutation<Pacote, Error, PacoteInsert>({
    mutationFn: createPacote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacotes", "admin"] });
      showSuccess("Pacote criado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 2. Atualizar Pacote
interface UpdatePacoteArgs {
    id: string;
    updates: PacoteUpdate;
}

const updatePacote = async ({ id, updates }: UpdatePacoteArgs): Promise<Pacote> => {
  const { data, error } = await supabase
    .from("pacotes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar pacote:", error);
    throw new Error(`Falha ao atualizar pacote: ${error.message}`);
  }
  return data as Pacote;
};

export const useUpdatePacote = () => {
  const queryClient = useQueryClient();
  return useMutation<Pacote, Error, UpdatePacoteArgs>({
    mutationFn: updatePacote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacotes", "admin"] });
      showSuccess("Pacote atualizado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 3. Deletar Pacote
const deletePacote = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("pacotes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar pacote:", error);
    throw new Error(`Falha ao deletar pacote: ${error.message}`);
  }
};

export const useDeletePacote = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePacote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pacotes", "admin"] });
      showSuccess("Pacote deletado com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};