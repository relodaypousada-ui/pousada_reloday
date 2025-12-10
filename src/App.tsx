import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import QuemSomos from "./pages/QuemSomos";
import ComoChegar from "./pages/ComoChegar";
import Galeria from "./pages/Galeria";
import Blog from "./pages/Blog";
import Contato from "./pages/Contato";
import Reserva from "./pages/Reserva";
import AcompanharReserva from "./pages/AcompanharReserva";
import Login from "./pages/Login";
import CriarPerfil from "./pages/CriarPerfil";
import Acomodacoes from "./pages/Acomodacoes";
import AdminDashboard from "./pages/AdminDashboard"; // Importação adicionada
import RecuperarSenha from "./pages/RecuperarSenha"; // Importação adicionada
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute"; // Importação adicionada

const queryClient = new QueryClient();

// Componente Wrapper para aplicar o layout nas rotas
const LayoutWrapper = ({ element }: { element: React.ReactNode }) => (
  <MainLayout>{element}</MainLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LayoutWrapper element={<Index />} />} />
            <Route path="/quem-somos" element={<LayoutWrapper element={<QuemSomos />} />} />
            <Route path="/acomodacoes" element={<LayoutWrapper element={<Acomodacoes />} />} />
            <Route path="/como-chegar" element={<LayoutWrapper element={<ComoChegar />} />} />
            <Route path="/galeria" element={<LayoutWrapper element={<Galeria />} />} />
            <Route path="/blog" element={<LayoutWrapper element={<Blog />} />} />
            <Route path="/contato" element={<LayoutWrapper element={<Contato />} />} />
            <Route path="/reserva" element={<LayoutWrapper element={<Reserva />} />} />
            <Route path="/acompanhar-reserva" element={<LayoutWrapper element={<AcompanharReserva />} />} />
            <Route path="/login" element={<LayoutWrapper element={<Login />} />} />
            <Route path="/criar-perfil" element={<LayoutWrapper element={<CriarPerfil />} />} />
            <Route path="/recuperar-senha" element={<LayoutWrapper element={<RecuperarSenha />} />} />
            
            {/* Rota Administrativa Protegida */}
            <Route 
              path="/admin" 
              element={<LayoutWrapper element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />} 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;