import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Hotel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGlobalConfig } from "@/integrations/supabase/configuracoes"; // Importar hook de configuração

const Footer: React.FC = () => {
  const { data: config } = useGlobalConfig();
  
  const siteTitle = config?.titulo_site || "Pousada Reloday";
  const email = config?.email_contato || "contato@pousadareloday.com.br";
  const phone = config?.telefone_principal || "(99) 99999-9999";
  const address = config?.endereco_fisico || "Rua Exemplo, 123, Cidade - UF";

  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Coluna 1: Logo e Descrição */}
        <div>
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <Hotel className="h-6 w-6" />
            <span className="font-bold text-xl">{siteTitle}</span>
          </Link>
          <p className="text-sm opacity-80">
            Seu refúgio perfeito para relaxar e aproveitar a natureza.
          </p>
        </div>

        {/* Coluna 2: Links Rápidos */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><Link to="/quem-somos" className="hover:underline">Quem Somos</Link></li>
            <li><Link to="/acomodacoes" className="hover:underline">Acomodações</Link></li>
            <li><Link to="/blog" className="hover:underline">Blog</Link></li>
            <li><Link to="/galeria" className="hover:underline">Galeria</Link></li>
          </ul>
        </div>

        {/* Coluna 3: Contato */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Fale Conosco</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{address}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>{phone}</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>{email}</span>
            </li>
          </ul>
        </div>

        {/* Coluna 4: Newsletter (Placeholder) */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
          <p className="text-sm opacity-80 mb-4">
            Receba nossas ofertas exclusivas.
          </p>
          {/* Placeholder para formulário de newsletter */}
          <input 
            type="email" 
            placeholder="Seu email" 
            className="w-full p-2 rounded text-gray-800"
          />
          <Button className="mt-2 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
            Assinar
          </Button>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 py-4 text-center text-xs opacity-70">
        &copy; {new Date().getFullYear()} {siteTitle}. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;