import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    // Exibe um spinner enquanto o estado de autenticação está sendo carregado
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

  // Nota: Para um sistema de administração real, você precisaria
  // verificar aqui se o 'user' tem uma função (role) de administrador.
  
  return <>{children}</>;
};

export default ProtectedRoute;