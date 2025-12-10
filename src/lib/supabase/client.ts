import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (supabaseUrl && supabaseAnonKey) {
  // Se as variáveis estiverem presentes, inicializa o cliente real
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Se as variáveis estiverem faltando, loga um erro e cria um cliente mockado
  console.error(
    "CRITICAL ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required but missing. Supabase client is not initialized. Authentication and database access will not work."
  );

  // Cria um objeto mockado que satisfaz minimamente a interface SupabaseClient
  // para evitar crashes no AuthContext.
  const dummyAuth = {
    getSession: () => Promise.resolve({ data: { session: null }, error: new Error("Supabase not configured.") }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured.") }),
    signUp: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured.") }),
    signOut: () => Promise.resolve({ error: new Error("Supabase not configured.") }),
  };

  // Usamos 'as unknown as SupabaseClient' para forçar a tipagem,
  // já que é um mock parcial.
  supabase = {
    auth: dummyAuth,
  } as unknown as SupabaseClient;
}

export { supabase };