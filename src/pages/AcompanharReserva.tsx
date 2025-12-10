import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Loader2, User as UserIcon } from "lucide-react";
import ProfileForm from "@/components/auth/ProfileForm";
import { useNavigate } from "react-router-dom";

const AcompanharReserva: React.FC = () => {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="container py-12 min-h-[60vh] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Este caso deve ser pego pelo ProtectedRoute, mas é um fallback seguro.
    return null; 
  }

  return (
    <div className="container py-12 min-h-[60vh]">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <UserIcon className="h-8 w-8 mr-3 text-primary" />
        Meu Perfil e Reservas
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna 1: Informações do Perfil e Edição */}
        <div className="lg:col-span-2 space-y-8">
          {profile ? (
            <ProfileForm profile={profile} />
          ) : (
            <Card>
                <CardHeader><CardTitle>Carregando Perfil...</CardTitle></CardHeader>
                <CardContent><Loader2 className="h-6 w-6 animate-spin text-primary" /></CardContent>
            </Card>
          )}

          {/* Placeholder para Reservas Ativas */}
          <Card>
            <CardHeader>
              <CardTitle>Minhas Reservas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aqui você verá a lista de suas reservas pendentes e confirmadas.
              </p>
              <Button variant="link" className="p-0 mt-2">Ver Histórico Completo</Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna 2: Ações Rápidas */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Ações da Conta</h3>
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full"
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
            <p className="text-xs text-muted-foreground mt-4 text-center">
                Você será redirecionado para a página inicial.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AcompanharReserva;