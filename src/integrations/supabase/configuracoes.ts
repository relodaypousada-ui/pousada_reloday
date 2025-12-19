import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

// ID fixo para a linha única de configurações
const CONFIG_ID = "00000000-0000-0000-0000-000000000000";

export interface Configuracoes {
  id: string;
  email_contato: string | null;
  telefone_principal: string | null;
  endereco_fisico: string | null;
  titulo_site: string | null;
  meta_descricao: string | null;
  updated_at: string | null;
  chave_pix: string | null; // NOVO
  mensagem_padrao_whatsapp: string | null; // NOVO
}

export type ConfiguracoesUpdate = Partial<Omit<Configuracoes, 'id' | 'updated_at'>>;

// --- Query Hook ---

const getGlobalConfig = async (): Promise<Configuracoes | null> => {
  const { data, error } = await supabase
    .from("configuracoes")
    .select("*")
    .eq("id", CONFIG_ID)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
    console.error("Erro ao buscar configurações globais:", error);
    throw new Error("Não foi possível carregar as configurações do site.");
  }

  return data as Configuracoes | null;
};

export const useGlobalConfig = () => {
  return useQuery<Configuracoes | null, Error>({
    queryKey: ["globalConfig"],
    queryFn: getGlobalConfig,
  });
};

// --- Mutation Hook ---

const updateGlobalConfig = async (updates: ConfiguracoesUpdate): Promise<Configuracoes> => {
  const { data, error } = await supabase
    .from("configuracoes")
    .update(updates)
    .eq("id", CONFIG_ID)
    .select()
    .single();

  if (error) {
    console.error("Erro ao atualizar configurações:", error);
    throw new Error(`Falha ao salvar configurações: ${error.message}`);
  }
  return data as Configuracoes;
};

export const useUpdateGlobalConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<Configuracoes, Error, ConfiguracoesUpdate>({
    mutationFn: updateGlobalConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["globalConfig"] });
      showSuccess("Configurações salvas com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};