import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { showError } from "@/utils/toast";

const BUCKET_NAME = "imagens_video"; // Corrigido para o nome do bucket do usuário

/**
 * Hook para gerenciar o upload de arquivos para o Supabase Storage.
 * @param folderPath O caminho da pasta dentro do bucket (ex: 'acomodacoes/suite-master').
 */
export const useStorageUpload = (folderPath: string) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    if (!file) {
      showError("Nenhum arquivo selecionado.");
      setIsUploading(false);
      return null;
    }

    // Gera um nome de arquivo único
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `${folderPath}/${fileName}`;

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Obtém a URL pública do arquivo
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      setIsUploading(false);
      setUploadProgress(100);
      return publicUrlData.publicUrl;

    } catch (error: any) {
      console.error("Erro no upload:", error);
      showError(`Falha no upload: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
  };
  
  // NOTE: Supabase JS client does not support progress tracking natively for browser uploads.
  // We keep setUploadProgress for future compatibility or manual implementation if needed,
  // but for now, it will jump from 0 to 100 on success/failure.

  return {
    uploadFile,
    isUploading,
    uploadProgress,
  };
};