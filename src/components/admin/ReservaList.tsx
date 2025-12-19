import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom"; // NOVO IMPORT
import { Reserva, useAdminReservas, useDeleteReserva, useConfirmWhatsappSent } from "@/integrations/supabase/reservas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, Trash2, Search, CheckCircle, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { showError, showSuccess } from "@/utils/toast";
import ReservaStatusBadge from "./ReservaStatusBadge";
import ReservaDetailsDialog from "./ReservaDetailsDialog";
import { useGlobalConfig } from "@/integrations/supabase/configuracoes"; 
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Helper para formatar a mensagem do WhatsApp
const generateWhatsAppLink = (reserva: Reserva, config: { chave_pix: string | null, mensagem_padrao_whatsapp: string | null }): string | null => {
    const whatsappNumber = reserva.profiles.whatsapp;
    if (!whatsappNumber) return null;

    const nomeCliente = reserva.profiles.full_name || "Cliente";
    const acomodacaoTitulo = reserva.acomodacoes.titulo;
    const valorTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reserva.valor_total);
    const chavePix = config.chave_pix || "Chave PIX não configurada";
    
    let messageTemplate = config.mensagem_padrao_whatsapp || 
        "Olá [NOME], sua reserva [ID_RESERVA] na [ACOMODACAO] foi solicitada. O valor total é [VALOR_TOTAL]. Para confirmar, realize o pagamento via PIX: [CHAVE_PIX].";

    const message = messageTemplate
        .replace(/\[NOME\]/g, nomeCliente)
        .replace(/\[ID_RESERVA\]/g, reserva.id.substring(0, 8))
        .replace(/\[ACOMODACAO\]/g, acomodacaoTitulo)
        .replace(/\[VALOR_TOTAL\]/g, valorTotal)
        .replace(/\[CHAVE_PIX\]/g, chavePix);

    // Remove caracteres não numéricos do número de telefone para o link
    const cleanNumber = whatsappNumber.replace(/\D/g, '');

    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};


const ReservaList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams(); // NOVO
  const { data: reservas, isLoading, isError, error } = useAdminReservas();
  const { data: config } = useGlobalConfig(); 
  const deleteMutation = useDeleteReserva();
  const confirmWhatsappMutation = useConfirmWhatsappSent(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Efeito para tratar o link de retorno
  useEffect(() => {
      const whatsappSent = searchParams.get('whatsapp_sent');
      const reservaId = searchParams.get('reserva_id');
      
      if (whatsappSent === 'true' && reservaId) {
          // Dispara a mutação para confirmar o envio
          confirmWhatsappMutation.mutate({ id: reservaId }, {
              onSuccess: () => {
                  // Limpa os parâmetros da URL após o sucesso
                  setSearchParams({}, { replace: true });
              },
              onError: (err) => {
                  showError(`Falha ao registrar confirmação: ${err.message}`);
                  setSearchParams({}, { replace: true });
              }
          });
      }
  }, [searchParams, setSearchParams, confirmWhatsappMutation]);


  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
        onError: (err) => {
            showError(err.message);
        }
    });
  };
  
  const handleOpenDetails = (reserva: Reserva) => {
      setSelectedReserva(reserva);
      setIsDialogOpen(true);
  };

  const handleSendPaymentLink = (reserva: Reserva) => {
      if (!config) {
          showError("Configurações do site não carregadas.");
          return;
      }
      
      const link = generateWhatsAppLink(reserva, config);
      
      if (link) {
          window.open(link, '_blank');
          showSuccess("Mensagem de pagamento aberta no WhatsApp. Clique no check para confirmar o envio.");
      } else {
          showError("Número de WhatsApp do cliente não cadastrado.");
      }
  };
  
  const handleConfirmWhatsappSent = (reservaId: string) => {
      confirmWhatsappMutation.mutate({ id: reservaId });
  };

  const filteredReservas = reservas?.filter(reserva => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reserva.acomodacoes.titulo.toLowerCase().includes(searchLower) ||
      reserva.profiles.full_name?.toLowerCase().includes(searchLower) ||
      reserva.id.toLowerCase().includes(searchLower)
    );
  });
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('pt-BR');
  };
  
  const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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
        <p className="text-destructive font-medium">Erro ao carregar reservas:</p>
        <p className="text-sm text-destructive/90 mt-1">
          {error.message}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por acomodação, hóspede ou ID..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {(!filteredReservas || filteredReservas.length === 0) ? (
        <div className="text-center p-6 text-muted-foreground">
          Nenhuma reserva encontrada.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Acomodação</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservas.map((reserva) => {
                const hasWhatsapp = !!reserva.profiles.whatsapp;
                const isWhatsappSent = !!reserva.whatsapp_sent_at;
                
                return (
                <TableRow key={reserva.id}>
                  <TableCell className="text-xs text-muted-foreground">{reserva.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-medium">{reserva.acomodacoes.titulo}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{reserva.profiles.full_name || "N/A"}</TableCell>
                  <TableCell className="text-sm">{formatDate(reserva.check_in_date)}</TableCell>
                  <TableCell className="font-semibold text-green-600">{formatCurrency(reserva.valor_total)}</TableCell>
                  <TableCell className="text-center">
                    <ReservaStatusBadge status={reserva.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2 flex justify-end items-center">
                    
                    {/* Botão de Enviar Pagamento via WhatsApp */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={hasWhatsapp ? "default" : "secondary"}
                                size="icon" 
                                onClick={() => handleSendPaymentLink(reserva)}
                                aria-label="Abrir WhatsApp"
                                disabled={!hasWhatsapp}
                                title={hasWhatsapp ? "Abrir link de pagamento via WhatsApp" : "WhatsApp não cadastrado"}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {hasWhatsapp ? "Abrir WhatsApp" : "WhatsApp não cadastrado"}
                        </TooltipContent>
                    </Tooltip>
                    
                    {/* Botão de Confirmar Envio */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button 
                                variant={isWhatsappSent ? "ghost" : "outline"}
                                size="icon" 
                                onClick={() => handleConfirmWhatsappSent(reserva.id)}
                                aria-label="Confirmar Envio WhatsApp"
                                disabled={confirmWhatsappMutation.isPending || isWhatsappSent}
                                title={isWhatsappSent ? `Enviado em ${formatDate(reserva.whatsapp_sent_at!)}` : "Confirmar envio do WhatsApp"}
                                className={isWhatsappSent ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : ""}
                            >
                              {confirmWhatsappMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              ) : isWhatsappSent ? (
                                  <CheckCircle className="h-4 w-4" />
                              ) : (
                                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {isWhatsappSent ? `Envio confirmado em ${formatDate(reserva.whatsapp_sent_at!)}` : "Confirmar envio do WhatsApp"}
                        </TooltipContent>
                    </Tooltip>
                    
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleOpenDetails(reserva)}
                        aria-label="Ver Detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" aria-label="Deletar">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação removerá permanentemente a reserva #{reserva.id.substring(0, 8)}.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(reserva.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Deletar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )})}
            </TableBody>
          </Table>
        </div>
      )}
      
      {selectedReserva && (
          <ReservaDetailsDialog 
              open={isDialogOpen} 
              onOpenChange={setIsDialogOpen} 
              reserva={selectedReserva} 
          />
      )}
    </>
  );
};

export default ReservaList;