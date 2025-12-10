import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Home, Calendar, Settings, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Clientes", href: "/admin/clientes", icon: Users },
  { name: "Acomodações", href: "/admin/acomodacoes", icon: Home },
  { name: "Comodidades", href: "/admin/comodidades", icon: ListChecks }, // Novo item
  { name: "Reservas", href: "/admin/reservas", icon: Calendar },
  { name: "Configurações", href: "/admin/config", icon: Settings },
];

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="w-full md:w-64 bg-sidebar border-r border-sidebar-border p-4 md:min-h-screen">
      <nav className="space-y-2">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
                           (item.href !== "/admin" && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;