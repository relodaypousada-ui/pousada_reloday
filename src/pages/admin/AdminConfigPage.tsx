import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Loader2, CreditCard, MessageSquare, Zap, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
  chave_pix: z.string().optional().or(z.literal("")),
  mensagem_padrao_whatsapp: z.string().optional().or(z.literal("")),
  hook_msg: z.string().url("URL de Webhook inválida.").optional().or(z.literal("")), // NOVO
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
      chave_pix: "",
      mensagem_padrao_whatsapp: "",
      hook_msg: "", // NOVO
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
        chave_pix: config.chave_pix || "",
        mensagem_padrao_whatsapp: config.mensagem_padrao_whatsapp || "",
        hook_msg: config.hook_msg || "", // NOVO
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
  
  const onSubmitWebhook = (values: ConfigFormValues) => {
    const updates: ConfiguracoesUpdate = {
      hook_msg: values.hook_msg || null,
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
  
  // URL base para o link de retorno (assumindo que o app está em localhost:8080 durante o desenvolvimento)
  const returnUrlBase = window.location.origin;
  const returnLinkExample = `${returnUrlBase}/admin/reservas?whatsapp_sent=true&reserva_id=RESERVA_ID`;

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
          
          {/* Pagamento e Comunicação */}
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
          
          {/* Configuração de Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Zap className="h-6 w-6 mr-2 text-muted-foreground" />
                Integração Webhook (n8n)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitWebhook)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="hook_msg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook (n8n)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://n8n.seu-dominio.com/webhook/..." {...field} />
                        </FormControl>
                        <FormDescription>
                            URL para onde os dados da nova reserva serão enviados automaticamente.
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
                    {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Salvar Webhook"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Documentação do Link de Retorno */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
                Link de Confirmação de Envio (WhatsApp)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Para que o botão de "Confirmação de Envio" na lista de reservas seja preenchido automaticamente após o envio bem-sucedido da mensagem via n8n/WhatsApp API, configure o link de retorno (Redirect URL) no seu fluxo do n8n.
                </p>
                
                <div>
                    <h4 className="font-semibold mb-2">URL de Retorno:</h4>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm break-all">
                        {returnLinkExample}
                    </div>
                    <FormDescription className="mt-1">
                        Substitua <code>RESERVA_ID</code> pelo ID completo da reserva.
                    </FormDescription>
                </div>
                
                <div>
                    <h4 className="font-semibold mb-2">JSON de Resposta (n8n):</h4>
                    <p className="text-sm text-muted-foreground mb-1">
                        O n8n deve retornar um JSON com <code>whatsapp_sent</code> como <code>true</code> para que o frontend registre o envio.
                    </p>
                    <pre className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-sm overflow-x-auto">
                        {`{
  "whatsapp_sent": true,
  "reserva_id": "ID_DA_RESERVA"
}`}
                    </pre>
                </div>
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