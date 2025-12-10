import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RecuperarSenha: React.FC = () => {
  return (
    <div className="container flex items-center justify-center py-12 min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Recuperar Senha</CardTitle>
          <p className="text-sm text-muted-foreground">
            Insira seu email para receber um link de redefinição.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <Input id="email" placeholder="seu.email@exemplo.com" type="email" className="mt-1" />
            </div>
            
            <Button type="submit" className="w-full">
              Enviar Link de Redefinição
            </Button>
          </form>
          
          <div className="mt-4 text-center text-sm">
            Lembrou da senha?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Voltar ao Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecuperarSenha;