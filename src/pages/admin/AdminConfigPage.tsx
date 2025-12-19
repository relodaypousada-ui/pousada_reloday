import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Loader2, CreditCard, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useGlobalConfig, useUpdateGlobalConfig, ConfiguracoesUpdate } from "@/integrations/supabase/configuracoes";
import { showError } from "@/utils/toast";

// Schema de Validação
const configSchema = z.object({
  email_contato: z.string().email("Email inválido.").optional().or(z.literal("")),
  telefone_principal: z.string().optional().or(z.literal("")),
  endereco_fisico: z.string().optional().or(z.literal("")),
  titulo_site: z.string().min(1, "O título é obrigatório.").optional().or(z.literal("")),
  meta_descricao: z.string().optional().or(z.literal("")),
  chave_pix: z.string().optional().or(z.literal("")), // NOVO
  mensagem_padrao_whatsapp: z.string().optional().or(z.literal("")), // NOVO
});

type ConfigFormValues = z.infer<typeof configSchema>;

const AdminConfigPage: React.FC = () => {
  const { data: config, isLoading: isLoadingConfig, isError: isErrorConfig } = useGlobalConfig();
  const updateMutation = useUpdateGlobalConfig();
  
  const form = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      email_contato: "",
      telefone_principal: "",
      endereco_fisico: "",
      titulo_site: "",
      meta_descricao: "",
      chave_pix: "", // NOVO
      mensagem_padrao_whatsapp: "", // NOVO
    },
    mode: "onChange",
  });

  // Sincroniza os dados carregados com o formulário
  useEffect(() => {
    if (config) {
      form.reset({
        email_contato: config.email_contato || "",
        telefone_principal: config.telefone_principal || "",
        endereco_fisico: config.endereco_fisico || "",
        titulo_site: config.titulo_site || "",
        meta_descricao: config.meta_descricao || "",
        chave_pix: config.chave_pix || "", // NOVO
        mensagem_padrao_whatsapp: config.mensagem_padrao_whatsapp || "", // NOVO
      });
    }
  }, [config, form]);

  const onSubmitContato = (values: ConfigFormValues) => {
    const updates: ConfiguracoesUpdate = {
      email_contato: values.email_contato || null,
      telefone_principal: values.telefone_principal || null,
      endereco_fisico: values.endereco_fisico || null,
    };
    updateMutation.mutate(updates);
  };

  const onSubmitSEO = (values: ConfigFormValues) => {
    const updates: ConfiguracoesUpdate = {
      titulo_site: values.titulo_site || null,
      meta_descricao: values.meta_descricao || null,
    };
    updateMutation.mutate(updates);
  };
  
  const onSubmitPagamento = (values: ConfigFormValues) => {
    const updates: ConfiguracoesUpdate = {
      chave_pix: values.chave_pix || null,
      mensagem_padrao_whatsapp: values.mensagem_padrao_whatsapp || null,
    };
    updateMutation.mutate(updates);
  };

  if (isLoadingConfig) {
    return (
      <div className="w-full py-12 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }
  
  if (isErrorConfig) {
      showError("Erro ao carregar configurações. Verifique a conexão e permissões.");
      return (
        <div className="w-full py-12 text-center text-destructive">
            Erro ao carregar configurações.
        </div>
      );
  }

  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold mb-8 flex items-center">
        <Settings className="h-8 w-8 mr-3 text-primary" />
        Configurações do Site
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal de Configurações */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Formulário de Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitContato)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email_contato"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@pousadareloday.com.br" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="telefone_principal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone Principal</FormLabel>
                        <FormControl>
                          <Input placeholder="(99) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endereco_fisico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço Físico</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua Exemplo, 123, Cidade - UF" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={updateMutation.isPending || !form.formState.isDirty}
                  >
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Contato"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* NOVO: Formulário de Pagamento e Comunicação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-muted-foreground" />
                Pagamento e Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPagamento)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="chave_pix"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave PIX para Pagamentos</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 123.456.789-00 ou email@pix.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mensagem_padrao_whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" /> Mensagem Padrão WhatsApp (Confirmação)
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Olá [NOME], sua reserva [ID_RESERVA] na [ACOMODACAO] foi solicitada. O valor total é [VALOR_TOTAL]. Para confirmar, realize o pagamento via PIX: [CHAVE_PIX]." 
                            {...field} 
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                            Use placeholders como [NOME], [ID_RESERVA], [ACOMODACAO], [VALOR_TOTAL], [CHAVE_PIX].
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={updateMutation.isPending || !form.formState.isDirty}
                  >
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Pagamento"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Formulário de SEO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Configurações de SEO e Títulos</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitSEO)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="titulo_site"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Site</FormLabel>
                        <FormControl>
                          <Input placeholder="Pousada Reloday - Seu Refúgio" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meta_descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Descrição (SEO)</FormLabel>
                        <FormControl>
                          <Input placeholder="Descrição curta para motores de busca." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="mt-4" 
                    disabled={updateMutation.isPending || !form.formState.isDirty}
                  >
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar SEO"}
                  </Button>
                </form>
              </Form>
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
                            <span className="text-muted-foreground text-sm">
                                {config?.updated_at ? new Date(config.updated_at).toLocaleDateString('pt-BR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                }) : 'N/A'}
                            </span>
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