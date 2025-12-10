import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Hotel, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useGlobalConfig } from "@/integrations/supabase/configuracoes"; // Importar hook de configuração

const navItems = [
  { name: "Home", href: "/" },
  { name: "Quem Somos", href: "/quem-somos" },
  { name: "Acomodações", href: "/acomodacoes" },
  { name: "Blog", href: "/blog" },
  { name: "Galeria", href: "/galeria" },
  { name: "Contato", href: "/contato" },
];

const Header: React.FC = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const { data: config } = useGlobalConfig(); // Buscar configurações

  const siteTitle = config?.titulo_site || "Pousada Reloday"; // Usar título configurado ou fallback

  const handleLogout = async () => {
    await signOut();
  };

  const NavLinks = () => (
    <nav className="flex space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );

  const AuthButton = () => {
    if (user) {
      return (
        <>
          {/* Link para o Painel Admin (visível apenas se logado) */}
          <Link to="/admin">
            <Button variant="ghost" size="icon" aria-label="Painel Admin" className="hidden lg:inline-flex">
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/acompanhar-reserva">
            <Button variant="ghost" size="icon" aria-label="Perfil">
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>
        </>
      );
    }
    return (
      <Link to="/login">
        <Button variant="ghost" className="hidden sm:inline-flex">
          Login
        </Button>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Hotel className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">{siteTitle}</span>
        </Link>

        {/* Navegação Principal */}
        {!isMobile && <NavLinks />}

        <div className="flex items-center space-x-2">
          {!isMobile && <AuthButton />}
          
          <Link to="/reserva">
            <Button variant="default">Reservar Agora</Button>
          </Link>
          
          {/* Menu Mobile */}
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 pt-6">
                  {navItems.map((item) => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        to={item.href}
                        className="text-lg font-medium hover:text-primary"
                      >
                        {item.name}
                      </Link>
                    </SheetClose>
                  ))}
                  
                  {user ? (
                    <>
                      <SheetClose asChild>
                        <Link to="/admin" className="text-lg font-medium hover:text-primary flex items-center">
                          <LayoutDashboard className="h-5 w-5 mr-2" /> Painel Admin
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/acompanhar-reserva" className="text-lg font-medium hover:text-primary flex items-center">
                          <UserIcon className="h-5 w-5 mr-2" /> Meu Perfil
                        </Link>
                      </SheetClose>
                      <Button 
                        onClick={handleLogout} 
                        variant="ghost" 
                        className="justify-start text-lg font-medium text-destructive hover:text-destructive/90"
                      >
                        <LogOut className="h-5 w-5 mr-2" /> Sair
                      </Button>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link to="/login" className="text-lg font-medium hover:text-primary">
                        Login / Perfil
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;