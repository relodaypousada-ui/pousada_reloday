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
  check_in_time: string; // Novo campo
  check_out_time: string; // Novo campo
  total_hospedes: number;
  valor_total: number;
  status: ReservaStatus;
  whatsapp_sent_at: string | null; // NOVO CAMPO
  // Joined data for admin view
  acomodacoes: {
    titulo: string;
    slug: string;
  };
  profiles: {
    full_name: string | null;
    whatsapp: string | null; // NOVO: Adicionando whatsapp
  };
}

export type ReservaInsert = Omit<Reserva, 'id' | 'created_at' | 'status' | 'acomodacoes' | 'profiles' | 'whatsapp_sent_at'>;
export type ReservaUpdate = Partial<Pick<Reserva, 'status' | 'check_in_date' | 'check_out_date' | 'check_in_time' | 'check_out_time' | 'total_hospedes' | 'valor_total' | 'whatsapp_sent_at'>>;

// New type for date ranges including time for reservations
export interface BlockedDateTime {
  start_date: string; // check_in_date or data_inicio
  end_date: string;   // check_out_date or data_fim
  end_time?: string;  // check_out_time (only for reservations)
  is_manual: boolean; // To distinguish manual blocks (full day) from reservations
}

// --- Query Hooks ---

// Função para buscar todas as reservas (Admin)
const getAllReservas = async (): Promise<Reserva[]> => {
  // O RLS garante que apenas admins podem buscar todas as reservas
  const { data, error } = await supabase
    .from("reservas")
    .select(`
      *,
      acomodacoes (titulo, slug),
      profiles (full_name, whatsapp)
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

// NOVO: Função para buscar reservas do usuário logado
const getMyReservas = async (userId: string): Promise<Reserva[]> => {
    // O RLS garante que o usuário só verá suas próprias reservas (policy: auth.uid() = user_id)
    const { data, error } = await supabase
        .from("reservas")
        .select(`
            *,
            acomodacoes (titulo, slug)
        `)
        .eq("user_id", userId)
        .order("check_in_date", { ascending: true });

    if (error) {
        console.error("Erro ao buscar minhas reservas:", error);
        throw new Error("Não foi possível carregar suas reservas.");
    }

    // Adiciona um profile mockado para manter a compatibilidade de tipagem, embora não seja usado
    return data.map(reserva => ({
        ...reserva,
        profiles: { full_name: null, whatsapp: null }, // Adicionando whatsapp null para compatibilidade
        whatsapp_sent_at: null, // Adicionando whatsapp_sent_at null para compatibilidade
    })) as Reserva[];
};


export const useMyReservas = (userId: string | undefined) => {
    return useQuery<Reserva[], Error>({
        queryKey: ["myReservas", userId],
        queryFn: () => getMyReservas(userId!),
        enabled: !!userId,
    });
};


// Função para buscar bloqueios manuais
export interface BloqueioManual {
    id: string;
    acomodacao_id: string;
    data_inicio: string;
    data_fim: string;
    motivo: string | null;
    created_at: string;
}

const getManualBlocks = async (acomodacaoId: string): Promise<BloqueioManual[]> => {
    const { data, error } = await supabase
        .from("bloqueios_manuais")
        .select("*")
        .eq("acomodacao_id", acomodacaoId);

    if (error) {
        console.error(`Erro ao buscar bloqueios manuais para acomodação ${acomodacaoId}:`, error);
        throw new Error("Não foi possível carregar os bloqueios manuais.");
    }
    
    return data as BloqueioManual[];
};

// Função para buscar datas bloqueadas (Reservas + Bloqueios Manuais)
const getBlockedDates = async (acomodacaoId: string): Promise<BlockedDateTime[]> => {
  // 1. Buscar datas de reservas confirmadas/pendentes
  const { data: reservaDates, error: reservaError } = await supabase
    .from("reservas")
    .select("check_in_date, check_out_date, check_out_time")
    .eq("acomodacao_id", acomodacaoId)
    .in("status", ["confirmada", "pendente"]);

  if (reservaError) {
    console.error(`Erro ao buscar datas de reservas para acomodação ${acomodacaoId}:`, reservaError);
    throw new Error("Não foi possível carregar a disponibilidade de datas de reservas.");
  }
  
  const blockedByReservas: BlockedDateTime[] = reservaDates.map(item => ({
      start_date: item.check_in_date,
      end_date: item.check_out_date,
      end_time: item.check_out_time,
      is_manual: false,
  }));
  
  // 2. Buscar bloqueios manuais
  const manualBlocks = await getManualBlocks(acomodacaoId);
  
  const blockedByManual: BlockedDateTime[] = manualBlocks.map(item => ({
      start_date: item.data_inicio,
      end_date: item.data_fim,
      end_time: undefined, // Full day block
      is_manual: true,
  }));
  
  // Combina as duas listas
  return [...blockedByReservas, ...blockedByManual];
};

export const useBlockedDates = (acomodacaoId: string | undefined) => {
  return useQuery<BlockedDateTime[], Error>({
    queryKey: ["blockedDates", acomodacaoId],
    queryFn: () => getBlockedDates(acomodacaoId!),
    enabled: !!acomodacaoId,
  });
};


// --- Mutation Hooks (CRUD de Bloqueios Manuais) ---

export type BloqueioManualInsert = Omit<BloqueioManual, 'id' | 'created_at'>;

const createManualBlock = async (newBlock: BloqueioManualInsert): Promise<BloqueioManual> => {
    const { data, error } = await supabase
        .from("bloqueios_manuais")
        .insert(newBlock)
        .select()
        .single();

    if (error) {
        console.error("Erro ao criar bloqueio manual:", error);
        throw new Error(`Falha ao criar bloqueio: ${error.message}`);
    }
    return data as BloqueioManual;
};

export const useCreateManualBlock = () => {
    const queryClient = useQueryClient();
    return useMutation<BloqueioManual, Error, BloqueioManualInsert>({
        mutationFn: createManualBlock,
        onSuccess: (newBlock) => {
            queryClient.invalidateQueries({ queryKey: ["manualBlocks", "allAdmin"] }); // Invalida a lista de admin
            queryClient.invalidateQueries({ queryKey: ["blockedDates", newBlock.acomodacao_id] });
            showSuccess("Bloqueio manual criado com sucesso!");
        },
        onError: (error) => {
            showError(error.message);
        }
    });
};

const deleteManualBlock = async (id: string): Promise<string> => {
    const { data, error } = await supabase
        .from("bloqueios_manuais")
        .delete()
        .eq("id", id)
        .select("acomodacao_id")
        .single();

    if (error) {
        console.error("Erro ao deletar bloqueio manual:", error);
        throw new Error(`Falha ao deletar bloqueio: ${error.message}`);
    }
    
    // Retorna o ID da acomodação para invalidação
    return data.acomodacao_id;
};

export const useDeleteManualBlock = () => {
    const queryClient = useQueryClient();
    return useMutation<string, Error, string>({
        mutationFn: deleteManualBlock,
        onSuccess: (acomodacaoId) => {
            queryClient.invalidateQueries({ queryKey: ["manualBlocks", "allAdmin"] }); // Invalida a lista de admin
            queryClient.invalidateQueries({ queryKey: ["blockedDates", acomodacaoId] });
            showSuccess("Bloqueio manual removido com sucesso!");
        },
        onError: (error) => {
            showError(error.message);
        }
    });
};

// --- Mutation Hooks (Nova Reserva) ---

const createReserva = async (newReserva: ReservaInsert): Promise<Reserva> => {
  // Status padrão é 'pendente'
  const { data, error } = await supabase
    .from("reservas")
    .insert({ ...newReserva, status: 'pendente' })
    .select(`
      *,
      acomodacoes (titulo, slug),
      profiles (full_name, whatsapp)
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
      // Invalida listas de reservas e datas bloqueadas
      queryClient.invalidateQueries({ queryKey: ["reservas", "admin"] });
      queryClient.invalidateQueries({ queryKey: ["myReservas", newReserva.user_id] });
      queryClient.invalidateQueries({ queryKey: ["blockedDates", newReserva.acomodacao_id] });
      showSuccess("Reserva solicitada com sucesso! Aguardando confirmação.");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};


// --- Mutation Hooks (Reservas existentes) ---

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
      profiles (full_name, whatsapp)
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
      queryClient.invalidateQueries({ queryKey: ["myReservas", updatedReserva.user_id] });
      queryClient.invalidateQueries({ queryKey: ["blockedDates", updatedReserva.acomodacao_id] });
      showSuccess("Reserva atualizada com sucesso!");
    },
    onError: (error) => {
      showError(error.message);
    }
  });
};

// Mutação para confirmar/reverter o envio do WhatsApp
interface ToggleWhatsappSentArgs {
    id: string;
    isCurrentlySent: boolean;
}

const toggleWhatsappSent = async ({ id, isCurrentlySent }: ToggleWhatsappSentArgs): Promise<Reserva> => {
    const newStatus = isCurrentlySent ? null : new Date().toISOString();
    const { data, error } = await supabase
        .from("reservas")
        .update({ whatsapp_sent_at: newStatus })
        .eq("id", id)
        .select(`
            *,
            acomodacoes (titulo, slug),
            profiles (full_name, whatsapp)
        `)
        .single();

    if (error) {
        console.error("Erro ao alternar status de envio do WhatsApp:", error);
        throw new Error(`Falha ao alternar status de envio: ${error.message}`);
    }
    return data as Reserva;
};

export const useConfirmWhatsappSent = () => {
    const queryClient = useQueryClient();
    return useMutation<Reserva, Error, ToggleWhatsappSentArgs>({
        mutationFn: toggleWhatsappSent,
        onSuccess: (updatedReserva, variables) => {
            queryClient.invalidateQueries({ queryKey: ["reservas", "admin"] });
            if (variables.isCurrentlySent) {
                showSuccess("Envio do WhatsApp desconfirmado!");
            } else {
                showSuccess("Envio do WhatsApp confirmado!");
            }
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