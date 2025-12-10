import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";
import { AcomodacaoMidia } from "@/integrations/supabase/acomodacoes";

interface VideoCardProps {
  media: AcomodacaoMidia;
  index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ media, index }) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 border-b">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Video className="h-5 w-5 mr-2 text-primary" />
          Vídeo Adicional {index + 1}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 aspect-video">
        <div className="w-full h-full bg-black flex items-center justify-center relative">
          {/* Assume que a URL é um link de embed válido (ex: YouTube embed) */}
          <iframe
            src={media.url}
            title={`Vídeo Adicional ${index + 1}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
            className="w-full h-full z-10"
          ></iframe>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCard;