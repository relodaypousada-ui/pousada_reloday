import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Hotel } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Hotel className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Pousada Reloday</span>
        </Link>

        {/* Navegação Principal */}
        {!isMobile && <NavLinks />}

        <div className="flex items-center space-x-4">
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
                    <Link
                      key={item.name}
                      to={item.href}
                      className="text-lg font-medium hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link to="/login" className="text-lg font-medium hover:text-primary">
                    Login / Perfil
                  </Link>
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