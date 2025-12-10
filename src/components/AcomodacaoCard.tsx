import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, DollarSign } from "lucide-react";
import { Acomodacao } from "@/integrations/supabase/acomodacoes"; // Importando a tipagem correta

interface AcomodacaoCardProps {
  acomodacao: Acomodacao;
}

const AcomodacaoCard: React.FC<AcomodacaoCardProps> = ({ acomodacao }) => {
  // Formatação simples de preço
  const precoFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(acomodacao.preco);

  // Verifica se o slug é válido antes de criar o link de detalhes
  const isSlugValid = acomodacao.slug && acomodacao.slug.length > 0;

  return (
    <article className="bg-card border rounded-xl shadow-lg overflow-hidden transition-transform hover:shadow-xl hover:scale-[1.01] duration-300">
      {/* Imagem */}
      <div className="h-56 w-full relative">
        <img
          src={acomodacao.imagem_url || "/placeholder-acomodacao.jpg"}
          alt={acomodacao.titulo}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      <div className="p-6">
        {/* Título */}
        <h3 className="text-2xl font-bold text-foreground line-clamp-1">{acomodacao.titulo}</h3>
        
        {/* Descrição */}
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 h-[60px]">
          {acomodacao.descricao}
        </p>

        {/* Detalhes */}
        <div className="flex items-center justify-between mt-4 border-t pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{acomodacao.capacidade} Hóspedes</span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-xs text-muted-foreground">A partir de</p>
            <span className="text-xl font-extrabold text-primary flex items-center">
              <DollarSign className="h-5 w-5 mr-1" />
              {precoFormatado}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 flex space-x-3">
          {isSlugValid ? (
            <Link to={`/acomodacoes/${acomodacao.slug}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Ver Detalhes
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full" disabled>
                Slug Inválido
            </Button>
          )}
          <Link to="/reserva" className="flex-1">
            <Button className="w-full">
              Reservar
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AcomodacaoCard;