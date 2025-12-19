import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Inicializa o cliente Supabase com a chave de serviço para acesso irrestrito
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ID fixo para a linha única de configurações
const CONFIG_ID = "00000000-0000-0000-0000-000000000000";

serve(async (req) => {
  try {
    // 1. Recebe o payload do trigger (nova reserva)
    const payload = await req.json();
    const newReserva = payload.record;
    const reservaId = newReserva.id;

    if (!reservaId) {
      return new Response(JSON.stringify({ error: "Nenhum ID de reserva encontrado no payload." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Busca a URL do Webhook nas configurações
    const { data: configData, error: configError } = await supabaseAdmin
      .from('configuracoes')
      .select('hook_msg')
      .eq('id', CONFIG_ID)
      .single();

    if (configError || !configData || !configData.hook_msg) {
      console.log("Webhook URL não configurada ou erro ao buscar configurações.");
      return new Response(JSON.stringify({ message: "Webhook URL não configurada, ignorando." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    const webhookUrl = configData.hook_msg;

    // 3. Busca os dados completos da reserva, acomodação e cliente
    const { data: fullReserva, error: reservaError } = await supabaseAdmin
      .from('reservas')
      .select(`
        *,
        acomodacoes (*),
        profiles (*)
      `)
      .eq('id', reservaId)
      .single();

    if (reservaError || !fullReserva) {
      console.error("Erro ao buscar dados completos da reserva:", reservaError);
      throw new Error("Falha ao buscar dados completos da reserva.");
    }
    
    // 4. Busca o perfil do administrador (para incluir dados de contato)
    const { data: adminProfile, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('is_admin', true)
        .limit(1)
        .single();

    if (adminError && adminError.code !== 'PGRST116') {
        console.error("Erro ao buscar perfil do administrador:", adminError);
    }
    
    // 5. Monta o payload final
    const finalPayload = {
      reserva: fullReserva,
      cliente: fullReserva.profiles,
      acomodacao: fullReserva.acomodacoes,
      admin_contato: adminProfile || null,
      timestamp: new Date().toISOString(),
    };

    // 6. Envia o payload para o Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    if (!response.ok) {
      console.error(`Webhook falhou com status: ${response.status}`);
      // Não lançamos erro para não reverter a transação, mas registramos o erro.
      return new Response(JSON.stringify({ error: `Webhook falhou: ${response.statusText}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Webhook enviado com sucesso." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro na Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});