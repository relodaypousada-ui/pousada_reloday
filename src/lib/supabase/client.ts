import { createClient } from "@supabase/supabase-js";

// Certifique-se de configurar estas variáveis de ambiente no seu projeto Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY devem ser definidas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);