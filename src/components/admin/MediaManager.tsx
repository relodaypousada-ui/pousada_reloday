import React, { useState } from "react";
import { AcomodacaoMidia } from "@/integrations/supabase/acomodacoes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Video, PlusCircle, Trash2, Loader2, GripVertical } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface MediaManagerProps {
  acomodacaoId: string;
  initialMedia: AcomodacaoMidia[];
}

// --- Supabase Mutations for Media ---

interface MediaInsert {
    acomodacao_id: string;
    url: string;
    tipo: 'image' | 'video';
    ordem: number;
}

const createMedia = async (newMedia: MediaInsert): Promise<AcomodacaoMidia> => {
    const { data, error } = await supabase
        .from("acomodacao_midia")
        .insert(newMedia)
        .select()
        .single();

    if (error) {
        console.error("Erro ao adicionar mídia:", error);
        throw new Error(`Falha ao adicionar mídia: ${error.message}`);
    }
    return data as AcomodacaoMidia;
};

const deleteMedia = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from("acomodacao_midia")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao deletar mídia:", error);
        throw new Error(`Falha ao deletar mídia: ${error.message}`);
    }
};

const updateMediaOrder = async (mediaUpdates: { id: string, ordem: number }[]): Promise<void> => {
    const { error } = await supabase
        .from("acomodacao_midia")
        .upsert(mediaUpdates, { onConflict: 'id' });

    if (error) {
        console.error("Erro ao atualizar ordem da mídia:", error);
        throw new Error(`Falha ao reordenar mídias: ${error.message}`);
    }
};

// --- Component ---

const MediaManager: React.FC<MediaManagerProps> = ({ acomodacaoId, initialMedia }) => {
  const queryClient = useQueryClient();
  const [mediaList, setMediaList] = useState<AcomodacaoMidia[]>(initialMedia);
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [isReordering, setIsReordering] = useState(false);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", acomodacaoId] });
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", "slug"] });
      showSuccess("Mídia adicionada com sucesso!");
      setNewUrl("");
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", acomodacaoId] });
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", "slug"] });
      showSuccess("Mídia removida com sucesso!");
    },
    onError: (error) => showError(error.message),
  });
  
  const reorderMutation = useMutation({
    mutationFn: updateMediaOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", acomodacaoId] });
      queryClient.invalidateQueries({ queryKey: ["acomodacoes", "slug"] });
      showSuccess("Ordem das mídias salva!");
      setIsReordering(false);
    },
    onError: (error) => showError(error.message),
  });

  // Sync state when initialMedia changes (e.g., after a successful fetch/update)
  React.useEffect(() => {
    setMediaList(initialMedia);
  }, [initialMedia]);

  const handleAddMedia = () => {
    if (!newUrl.trim()) {
      showError("A URL da mídia não pode estar vazia.");
      return;
    }
    
    // Determina a próxima ordem (última ordem + 1)
    const nextOrder = mediaList.length > 0 ? Math.max(...mediaList.map(m => m.ordem)) + 1 : 0;

    createMutation.mutate({
      acomodacao_id: acomodacaoId,
      url: newUrl.trim(),
      tipo: newType,
      ordem: nextOrder,
    });
  };

  const handleRemoveMedia = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  // Drag and Drop Handlers (Simplified)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData("mediaIndex", index.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("mediaIndex"));
    
    if (dragIndex === dropIndex) return;

    const newMediaList = [...mediaList];
    const [draggedItem] = newMediaList.splice(dragIndex, 1);
    newMediaList.splice(dropIndex, 0, draggedItem);

    // Atualiza o estado local e habilita o botão de salvar ordem
    setMediaList(newMediaList);
    setIsReordering(true);
  };
  
  const handleSaveOrder = () => {
      const updates = mediaList.map((media, index) => ({
          id: media.id,
          ordem: index, // A nova ordem é o índice na lista
      }));
      reorderMutation.mutate(updates);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Galeria de Mídias Adicionais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário de Adição */}
        <div className="flex flex-col md:flex-row gap-3">
          <Select value={newType} onValueChange={(value: 'image' | 'video') => setNewType(value)}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image">Imagem</SelectItem>
              <SelectItem value="video">Vídeo (URL)</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={newType === 'image' ? "URL da Imagem Adicional" : "URL do Vídeo (Ex: Youtube Embed)"}
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleAddMedia} 
            disabled={createMutation.isPending || !newUrl.trim()}
            className="w-full md:w-auto"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
            Adicionar
          </Button>
        </div>

        {/* Lista de Mídias */}
        {mediaList.length > 0 && (
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Arraste e solte para reordenar. Clique em "Salvar Ordem" após reordenar.</p>
                    {isReordering && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={handleSaveOrder}
                            disabled={reorderMutation.isPending}
                        >
                            {reorderMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Salvar Ordem"}
                        </Button>
                    )}
                </div>
                <div className="space-y-2">
                    {mediaList.map((media, index) => (
                        <div
                            key={media.id}
                            className="flex items-center p-3 border rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-grab"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(e, index)}
                        >
                            <GripVertical className="h-5 w-5 mr-3 text-muted-foreground cursor-grab" />
                            
                            {media.tipo === 'image' ? (
                                <Image className="h-5 w-5 mr-3 text-primary" />
                            ) : (
                                <Video className="h-5 w-5 mr-3 text-red-500" />
                            )}
                            
                            <span className="flex-1 truncate text-sm">{media.url}</span>
                            <span className={cn("text-xs font-medium ml-4 px-2 py-1 rounded-full", media.tipo === 'image' ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800")}>
                                {media.tipo === 'image' ? "Imagem" : "Vídeo"}
                            </span>
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveMedia(media.id)}
                                disabled={deleteMutation.isPending}
                                className="ml-2 text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {mediaList.length === 0 && (
            <p className="text-center text-muted-foreground text-sm">Nenhuma mídia adicional cadastrada.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaManager;