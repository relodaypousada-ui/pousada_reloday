import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";
import { Comodidade } from "./acomodacoes"; // Reutilizando a interface

// Tipagem para inserção/atualização
export type ComodidadeInsert = Omit<Comodidade, 'id'>;

// --- Query Hooks ---

const getAllComodidades = async (): Promise<Comodidade[]> => {
  const { data, error } = await supabase
    .from("comodidades")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("Erro ao buscar comodidades:", error);
    throw new Error("Não foi possível carregar a lista de comodidades.");
  }
  return data as Comodidade[];
};

export const useAllComodidades = () => {
  return useQuery<Comodidade[], Error>({
    queryKey: ["comodidades", "all"],
    queryFn: getAllComodidades,
  });
};

// --- Mutation Hooks ---

// 1. Criar Comodidade
const createComodidade = async (newComodidade: ComodidadeInsert): Promise<Comodidade> => {
  const { data, error } = await supabase
    .from("comodidades")
    .insert(newComodidade)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar comodidade:", error);
    throw new Error(`Falha ao criar comodidade: ${error.message}`);
  }
  return data as Comodidade;
};

export const useCreateComodidade = () => {
  const queryClient = useQueryClient();
  return useMutation<Comodidade, Error, ComodidadeInsert>({
    mutationFn: createComodidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comodidades"] });
      showSuccess("Comodidade criada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 2. Atualizar Comodidade
interface UpdateComodidadeArgs {
    id: string;
    updates: Partial<ComodidadeInsert>;
}

const updateComodidade = async ({ id, updates }: UpdateComodidadeArgs): Promise<Comodidade> => {
  const { data, error } = await supabase
    .from("comodidades")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar comodidade:", error);
    throw new Error(`Falha ao atualizar comodidade: ${error.message}`);
  }
  return data as Comodidade;
};

export const useUpdateComodidade = () => {
  const queryClient = useQueryClient();
  return useMutation<Comodidade, Error, UpdateComodidadeArgs>({
    mutationFn: updateComodidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comodidades"] });
      showSuccess("Comodidade atualizada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 3. Deletar Comodidade
const deleteComodidade = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("comodidades")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar comodidade:", error);
    throw new Error(`Falha ao deletar comodidade: ${error.message}`);
  }
};

export const useDeleteComodidade = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteComodidade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comodidades"] });
      showSuccess("Comodidade deletada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};