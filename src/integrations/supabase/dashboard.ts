import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

// --- Funções de Contagem ---

// 1. Contar Reservas Pendentes
const countPendingReservas = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("reservas")
    .select("id", { count: "exact" })
    .eq("status", "pendente");

  if (error) {
    console.error("Erro ao contar reservas pendentes:", error);
    throw new Error("Falha ao carregar contagem de reservas.");
  }
  return count ?? 0;
};

export const useCountPendingReservas = () => {
  return useQuery<number, Error>({
    queryKey: ["dashboard", "pendingReservasCount"],
    queryFn: countPendingReservas,
  });
};

// 2. Contar Acomodações
const countAcomodacoes = async (): Promise<number> => {
  const { count, error } = await supabase
    .from("acomodacoes")
    .select("id", { count: "exact" });

  if (error) {
    console.error("Erro ao contar acomodações:", error);
    throw new Error("Falha ao carregar contagem de acomodações.");
  }
  return count ?? 0;
};

export const useCountAcomodacoes = () => {
  return useQuery<number, Error>({
    queryKey: ["dashboard", "acomodacoesCount"],
    queryFn: countAcomodacoes,
  });
};

// 3. Contar Perfis de Usuários (Clientes)
const countProfiles = async (): Promise<number> => {
  // Contamos todos os perfis, exceto o perfil fixo de configuração (se existir)
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact" });

  if (error) {
    console.error("Erro ao contar perfis:", error);
    throw new Error("Falha ao carregar contagem de clientes.");
  }
  return count ?? 0;
};

export const useCountProfiles = () => {
  return useQuery<number, Error>({
    queryKey: ["dashboard", "profilesCount"],
    queryFn: countProfiles,
  });
};