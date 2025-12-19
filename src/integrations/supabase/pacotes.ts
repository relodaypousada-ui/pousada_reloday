import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { CategoriaPacote } from "./categoriasPacotes"; // Importando a nova tipagem

export interface PacoteMidia {
  id: string;
  url: string;
  tipo: 'image' | 'video';
  ordem: number;
}

export interface Pacote {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number;
  categoria_id: string | null; // NOVO CAMPO: Referência ao ID da categoria
  imagem_url: string | null;
  created_at: string;
  midia?: PacoteMidia[];
  // Dados de join para exibição
  categorias_pacotes?: CategoriaPacote | null;
}

// Tipagem para inserção/atualização
export type PacoteInsert = Omit<Pacote, 'id' | 'created_at' | 'midia' | 'categorias_pacotes'>;
export type PacoteUpdate = Partial<PacoteInsert>;

// --- Query Hooks ---

// Fragmento de select para join de categoria
const CATEGORIA_SELECT_FRAGMENT = `
  *,
  categorias_pacotes (id, nome, slug),
  midia:pacotes_midia (id, url, tipo, ordem)
`;

// Função para buscar TODOS os pacotes (Admin)
const getAdminPacotes = async (): Promise<Pacote[]> => {
  const { data, error } = await supabase
    .from("pacotes")
    .select(CATEGORIA_SELECT_FRAGMENT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar pacotes para o admin:", error);
    throw new Error("Não foi possível carregar a lista de pacotes. Verifique suas permissões.");
  }
  
  // Ordena a mídia
  return data.map(pacote => ({
      ...pacote,
      midia: pacote.midia?.sort((a, b) => a.ordem - b.ordem) || [],
  })) as Pacote[];
};

export const useAdminPacotes = () => {
  return useQuery<Pacote[], Error>({
    queryKey: ["pacotes", "admin"],
    queryFn: getAdminPacotes,
  });
};

// Função para buscar um único pacote pelo ID (Admin)
const getPacoteById = async (id: string): Promise<Pacote | null> => {
  const { data, error } = await supabase
    .from("pacotes")
    .select(CATEGORIA_SELECT_FRAGMENT)
    .eq("id", id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error("Erro ao buscar pacote por ID:", error);
    throw new Error("Não foi possível carregar o pacote.");
  }
  
  if (data) {
      return {
          ...data,
          midia: data.midia?.sort((a, b) => a.ordem - b.ordem) || [],
      } as Pacote;
  }

  return null;
};

export const usePacote = (id: string) => {
  return useQuery<Pacote | null, Error>({
    queryKey: ["pacotes", id],
    queryFn: () => getPacoteById(id),
    enabled: !!id,
  });
};


// --- Mutation Hooks (CRUD Admin) ---

// 1. Criar Pacote
const createPacote = async (newPacote: PacoteInsert): Promise<Pacote> => {
  const { data, error } = await supabase
    .from("pacotes")
    .insert(newPacote)
    .select(CATEGORIA_SELECT_FRAGMENT)
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
    .select(CATEGORIA_SELECT_FRAGMENT)
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
    onSuccess: (updatedPacote) => {
      queryClient.invalidateQueries({ queryKey: ["pacotes", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["pacotes", updatedPacote.id] });
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