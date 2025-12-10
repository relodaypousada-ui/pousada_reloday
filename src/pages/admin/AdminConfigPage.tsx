import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminConfigPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Settings className="h-8 w-8 mr-3 text-primary" />
        Configurações do Site
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal de Configurações */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-contato">Email de Contato</Label>
                <Input id="email-contato" placeholder="contato@pousadareloday.com.br" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone Principal</Label>
                <Input id="telefone" placeholder="(99) 99999-9999" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Físico</Label>
                <Input id="endereco" placeholder="Rua Exemplo, 123, Cidade - UF" />
              </div>
              <Button className="mt-4">Salvar Contato</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Configurações de SEO e Títulos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo-site">Título do Site</Label>
                <Input id="titulo-site" placeholder="Pousada Reloday - Seu Refúgio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta-descricao">Meta Descrição (SEO)</Label>
                <Input id="meta-descricao" placeholder="Descrição curta para motores de busca." />
              </div>
              <Button className="mt-4">Salvar SEO</Button>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Lateral: Status e Ações */}
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Status do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Conexão Supabase:</span>
                            <span className="text-green-600 font-semibold">OK</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Última Atualização:</span>
                            <span className="text-muted-foreground text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminConfigPage;