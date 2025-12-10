import React from "react";
import { useAllProfiles, Profile } from "@/integrations/supabase/profiles";
import { Loader2, User, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AdminUsersPage: React.FC = () => {
  const { data: profiles, isLoading, isError, error } = useAllProfiles();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredProfiles = profiles?.filter(profile => 
    profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center p-6 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-destructive font-medium">Erro de Permissão ou Conexão:</p>
          <p className="text-sm text-destructive/90 mt-1">
            {error.message}. Certifique-se de que o usuário logado é um administrador e que a política RLS foi aplicada corretamente.
          </p>
        </div>
      );
    }

    if (!filteredProfiles || filteredProfiles.length === 0) {
      return (
        <div className="text-center p-6 text-muted-foreground">
          Nenhum perfil encontrado.
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Completo</TableHead>
            <TableHead>ID do Usuário</TableHead>
            <TableHead className="text-center">Admin</TableHead>
            <TableHead className="text-right">Última Atualização</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {profile.full_name || "N/A"}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground truncate max-w-xs">{profile.id}</TableCell>
              <TableCell className="text-center">
                {profile.is_admin ? (
                  <Badge variant="default">Sim</Badge>
                ) : (
                  <Badge variant="secondary">Não</Badge>
                )}
              </TableCell>
              <TableCell className="text-right text-sm">
                {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR') : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Gerenciamento de Clientes</CardTitle>
          <p className="text-muted-foreground">Visualize e gerencie todos os perfis de usuários cadastrados.</p>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou ID do usuário..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="overflow-x-auto">
            {renderContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;