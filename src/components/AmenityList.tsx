import React from "react";
import { Comodidade } from "@/integrations/supabase/acomodacoes";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface AmenityListProps {
  comodidades: Comodidade[];
}

// Mapeamento dinâmico de strings para componentes Lucide React
const Icon = ({ name, className }: { name: string | null, className?: string }) => {
  if (!name) return null;
  
  // O nome do ícone deve corresponder exatamente ao export do lucide-react
  const LucideIcon = (LucideIcons as any)[name];

  if (!LucideIcon) {
    console.warn(`Ícone Lucide não encontrado para o nome: ${name}`);
    return null;
  }

  return <LucideIcon className={cn("h-5 w-5", className)} />;
};

const AmenityList: React.FC<AmenityListProps> = ({ comodidades }) => {
  if (!comodidades || comodidades.length === 0) {
    return (
      <div className="text-muted-foreground italic">
        Nenhuma comodidade cadastrada para esta acomodação.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {comodidades.map((comodidade) => (
        <div 
          key={comodidade.id} 
          className="flex items-center space-x-3 p-3 bg-accent rounded-lg shadow-sm"
        >
          <Icon name={comodidade.icone} className="text-primary" />
          <span className="text-sm font-medium text-accent-foreground">
            {comodidade.nome}
          </span>
        </div>
      ))}
    </div>
  );
};

export default AmenityList;