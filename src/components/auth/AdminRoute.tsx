import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, isAdmin, isLoading, profile } = useAuth();

  // Log de depuração para entender o fluxo de carregamento
  console.log("AdminRoute Check:", { 
    isLoading, 
    user: user ? user.id : 'null', 
    isAdmin, 
    profileStatus: profile ? 'Loaded' : 'Loading/Null' 
  });

  if (isLoading) {
    // Exibe um spinner enquanto o estado de autenticação e o perfil estão sendo carregados
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Se não houver usuário, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Se o usuário não for administrador, exibe um erro e redireciona para a home
    showError("Acesso negado. Você não tem permissões de administrador.");
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminRoute;