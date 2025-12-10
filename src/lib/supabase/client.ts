import { createClient } from "@supabase/supabase-js";

// Certifique-se de configurar estas variáveis de ambiente no seu projeto Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser definidas. A autenticação e o acesso ao banco de dados não funcionarão corretamente até que sejam configuradas.");
}

// Garantimos que createClient receba strings, usando fallback para evitar o erro de .trim()
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");