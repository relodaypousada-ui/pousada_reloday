import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export interface CategoriaPacote {
  id: string;
  nome: string;
  slug: string;
  created_at: string;
}

export type CategoriaPacoteInsert = Omit<CategoriaPacote, 'id' | 'created_at'>;
export type CategoriaPacoteUpdate = Partial<CategoriaPacoteInsert>;

// --- Query Hooks ---

// Busca todas as categorias (público)
const getAllCategorias = async (): Promise<CategoriaPacote[]> => {
  const { data, error } = await supabase
    .from("categorias_pacotes")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar categorias de pacotes:", error);
    throw new Error("Não foi possível carregar a lista de categorias.");
  }
  return data as CategoriaPacote[];
};

export const useAllCategoriasPacotes = () => {
  return useQuery<CategoriaPacote[], Error>({
    queryKey: ["categoriasPacotes", "all"],
    queryFn: getAllCategorias,
  });
};

// --- Mutation Hooks (Admin CRUD) ---

// 1. Criar Categoria
const createCategoria = async (newCategoria: CategoriaPacoteInsert): Promise<CategoriaPacote> => {
  const { data, error } = await supabase
    .from("categorias_pacotes")
    .insert(newCategoria)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar categoria:", error);
    throw new Error(`Falha ao criar categoria: ${error.message}`);
  }
  return data as CategoriaPacote;
};

export const useCreateCategoriaPacote = () => {
  const queryClient = useQueryClient();
  return useMutation<CategoriaPacote, Error, CategoriaPacoteInsert>({
    mutationFn: createCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasPacotes"] });
      showSuccess("Categoria criada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 2. Atualizar Categoria
interface UpdateCategoriaArgs {
    id: string;
    updates: CategoriaPacoteUpdate;
}

const updateCategoria = async ({ id, updates }: UpdateCategoriaArgs): Promise<CategoriaPacote> => {
  const { data, error } = await supabase
    .from("categorias_pacotes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar categoria:", error);
    throw new Error(`Falha ao atualizar categoria: ${error.message}`);
  }
  return data as CategoriaPacote;
};

export const useUpdateCategoriaPacote = () => {
  const queryClient = useQueryClient();
  return useMutation<CategoriaPacote, Error, UpdateCategoriaArgs>({
    mutationFn: updateCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasPacotes"] });
      showSuccess("Categoria atualizada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 3. Deletar Categoria
const deleteCategoria = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("categorias_pacotes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar categoria:", error);
    throw new Error(`Falha ao deletar categoria: ${error.message}`);
  }
};

export const useDeleteCategoriaPacote = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categoriasPacotes"] });
      showSuccess("Categoria deletada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};