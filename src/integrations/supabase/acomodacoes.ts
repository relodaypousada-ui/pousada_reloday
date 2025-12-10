import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export interface Acomodacao {
  id: string;
  titulo: string;
  slug: string;
  descricao: string | null;
  capacidade: number;
  preco: number;
  imagem_url: string | null;
  is_active: boolean; // Adicionando is_active para o admin
}

// Tipagem para os dados de entrada do formulário
export type AcomodacaoInsert = Omit<Acomodacao, 'id' | 'created_at'>;
export type AcomodacaoUpdate = Partial<AcomodacaoInsert>;

// Função para buscar todas as acomodações ativas (para o frontend público)
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

// Função para buscar TODAS as acomodações (para o painel admin)
const getAdminAcomodacoes = async (): Promise<Acomodacao[]> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .select("*") // Seleciona todos os campos, incluindo is_active
    .order("titulo", { ascending: true });

  if (error) {
    console.error("Erro ao buscar acomodações para o admin:", error);
    throw new Error("Não foi possível carregar a lista de acomodações. Verifique suas permissões de administrador.");
  }

  return data as Acomodacao[];
};

// Função para buscar uma única acomodação pelo ID
const getAcomodacaoById = async (id: string): Promise<Acomodacao | null> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error("Erro ao buscar acomodação por ID:", error);
    throw new Error("Não foi possível carregar a acomodação.");
  }

  return data as Acomodacao | null;
};

// Hooks de Query
export const useAllAcomodacoes = () => {
  return useQuery<Acomodacao[], Error>({
    queryKey: ["acomodacoes", "all"],
    queryFn: getAllAcomodacoes,
  });
};

export const useFeaturedAcomodacoes = () => {
  return useQuery<Acomodacao[], Error>({
    queryKey: ["acomodacoes", "featured"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acomodacoes")
        .select("id, titulo, slug, descricao, capacidade, preco, imagem_url")
        .eq("is_active", true)
        .limit(3)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar acomodações em destaque:", error);
        throw new Error("Não foi possível carregar as acomodações em destaque.");
      }
      return data as Acomodacao[];
    },
  });
};

export const useAdminAcomodacoes = () => {
  return useQuery<Acomodacao[], Error>({
    queryKey: ["acomodacoes", "admin"],
    queryFn: getAdminAcomodacoes,
  });
};

export const useAcomodacao = (id: string) => {
  return useQuery<Acomodacao | null, Error>({
    queryKey: ["acomodacoes", id],
    queryFn: () => getAcomodacaoById(id),
    enabled: !!id,
  });
};

// Hooks de Mutação (CRUD Admin)

// 1. Criar Acomodação
const createAcomodacao = async (newAcomodacao: AcomodacaoInsert): Promise<Acomodacao> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .insert(newAcomodacao)
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar acomodação:", error);
    throw new Error(`Falha ao criar acomodação: ${error.message}`);
  }
  return data as Acomodacao;
};

export const useCreateAcomodacao = () => {
  const queryClient = useQueryClient();
  return useMutation<Acomodacao, Error, AcomodacaoInsert>({
    mutationFn: createAcomodacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes"] });
      showSuccess("Acomodação criada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 2. Atualizar Acomodação
interface UpdateAcomodacaoArgs {
    id: string;
    updates: AcomodacaoUpdate;
}

const updateAcomodacao = async ({ id, updates }: UpdateAcomodacaoArgs): Promise<Acomodacao> => {
  const { data, error } = await supabase
    .from("acomodacoes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar acomodação:", error);
    throw new Error(`Falha ao atualizar acomodação: ${error.message}`);
  }
  return data as Acomodacao;
};

export const useUpdateAcomodacao = () => {
  const queryClient = useQueryClient();
  return useMutation<Acomodacao, Error, UpdateAcomodacaoArgs>({
    mutationFn: updateAcomodacao,
    onSuccess: (updatedAcomodacao) => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes"] });
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", updatedAcomodacao.id] });
      showSuccess("Acomodação atualizada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// 3. Deletar Acomodação
const deleteAcomodacao = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("acomodacoes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar acomodação:", error);
    throw new Error(`Falha ao deletar acomodação: ${error.message}`);
  }
};

export const useDeleteAcomodacao = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteAcomodacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes"] });
      showSuccess("Acomodação deletada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};