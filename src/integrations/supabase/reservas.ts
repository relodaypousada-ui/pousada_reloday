import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { showError, showSuccess } from "@/utils/toast";

export type ReservaStatus = 'pendente' | 'confirmada' | 'cancelada' | 'concluida';

export interface Reserva {
  id: string;
  created_at: string;
  user_id: string;
  acomodacao_id: string;
  check_in_date: string;
  check_out_date: string;
  total_hospedes: number;
  valor_total: number;
  status: ReservaStatus;
  // Joined data for admin view
  acomodacoes: {
    titulo: string;
    slug: string;
  };
  profiles: {
    full_name: string | null;
  };
}

export type ReservaInsert = Omit<Reserva, 'id' | 'created_at' | 'status' | 'acomodacoes' | 'profiles'>;
export type ReservaUpdate = Partial<Pick<Reserva, 'status' | 'check_in_date' | 'check_out_date' | 'total_hospedes' | 'valor_total'>>;

// --- Query Hooks ---

// Função para buscar todas as reservas (Admin)
const getAllReservas = async (): Promise<Reserva[]> => {
  // O RLS garante que apenas admins podem buscar todas as reservas
  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      acomodacoes (titulo, slug),
      profiles (full_name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar todas as reservas:", error);
    throw new Error("Não foi possível carregar a lista de reservas. Verifique suas permissões de administrador.");
  }

  return data as Reserva[];
};

export const useAdminReservas = () => {
  return useQuery<Reserva[], Error>({
    queryKey: ["reservas", "admin"],
    queryFn: getAllReservas,
  });
};

// --- Mutation Hooks ---

// 1. Criar Reserva (Cliente)
const createReserva = async (newReserva: ReservaInsert): Promise<Reserva> => {
    // O status inicial é 'pendente' por padrão no banco de dados
    const { data, error } = await supabase
        .from("reservas")
        .insert(newReserva)
        .select(`
            *,
            acomodacoes (titulo, slug),
            profiles (full_name)
        `)
        .single();

    if (error) {
        console.error("Erro ao criar reserva:", error);
        throw new Error(`Falha ao criar reserva: ${error.message}`);
    }
    return data as Reserva;
};

export const useCreateReserva = () => {
    const queryClient = useQueryClient();
    return useMutation<Reserva, Error, ReservaInsert>({
        mutationFn: createReserva,
        onSuccess: (newReserva) => {
            // Invalida o cache de reservas do admin e do usuário (se implementado)
            queryClient.invalidateQueries({ queryKey: ["reservas", "admin"] });
            queryClient.invalidateQueries({ queryKey: ["myReservas", newReserva.user_id] });
            showSuccess("Reserva solicitada com sucesso! Aguardando confirmação.");
        },
        onError: (error) => {
            showError(error.message);
        }
    });
};


interface UpdateReservaArgs {
    id: string;
    updates: ReservaUpdate;
}

const updateReserva = async ({ id, updates }: UpdateReservaArgs): Promise<Reserva> => {
  const { data, error } = await supabase
    .from("reservas")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      acomodacoes (titulo, slug),
      profiles (full_name)
    `)
    .single();

  if (error) {
    console.error("Erro ao atualizar reserva:", error);
    throw new Error(`Falha ao atualizar reserva: ${error.message}`);
  }
  return data as Reserva;
};

export const useUpdateReserva = () => {
  const queryClient = useQueryClient();
  return useMutation<Reserva, Error, UpdateReservaArgs>({
    mutationFn: updateReserva,
    onSuccess: (updatedReserva) => {
      queryClient.invalidateQueries({ queryKey: ["reservas", "admin"] });
      // Invalida também as reservas do usuário específico, se necessário
      queryClient.invalidateQueries({ queryKey: ["myReservas", updatedReserva.user_id] });
      showSuccess("Reserva atualizada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

const deleteReserva = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from("reservas")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao deletar reserva:", error);
    throw new Error(`Falha ao deletar reserva: ${error.message}`);
  }
};

export const useDeleteReserva = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteReserva,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservas", "admin"] });
      showSuccess("Reserva deletada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};