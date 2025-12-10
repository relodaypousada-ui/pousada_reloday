import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { showSuccess, showError } from "@/utils/toast";
import { Profile, useMyProfile } from "@/integrations/supabase/profiles"; // Importando Profile e useMyProfile

// Tipagem para o contexto de autenticação
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Adicionando o perfil
  isAdmin: boolean; // Adicionando status de administrador
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Hook para buscar o perfil do usuário logado
  const { data: profile, isLoading: isLoadingProfile } = useMyProfile(user?.id);
  
  const isLoading = isLoadingAuth || isLoadingProfile;
  const isAdmin = profile?.is_admin ?? false;

  useEffect(() => {
    // 1. Carregar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    // 2. Configurar listener para mudanças de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoadingAuth(false);
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Função de Login
  const signIn = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoadingAuth(false);

    if (error) {
      showError(`Erro ao fazer login: ${error.message}`);
      throw error;
    }
    showSuccess("Login realizado com sucesso!");
  };

  // Função de Registro
  const signUp = async (email: string, password: string) => {
    setIsLoadingAuth(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setIsLoadingAuth(false);

    if (error) {
      showError(`Erro ao criar conta: ${error.message}`);
      throw error;
    }
    showSuccess("Conta criada com sucesso! Verifique seu email para confirmar.");
  };

  // Função de Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError(`Erro ao sair: ${error.message}`);
      throw error;
    }
    showSuccess("Você saiu da sua conta.");
    setSession(null);
    setUser(null);
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};