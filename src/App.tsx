import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import AdminLayout from "./components/layout/AdminLayout";
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
import AcomodacaoDetalhe from "./pages/AcomodacaoDetalhe";
import AdminDashboard from "./pages/AdminDashboard";
import RecuperarSenha from "./pages/RecuperarSenha";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAcomodacoesPage from "./pages/admin/AdminAcomodacoesPage";
import AdminComodidadesPage from "./pages/admin/AdminComodidadesPage";
import AdminConfigPage from "./pages/admin/AdminConfigPage";
import AdminSlidesPage from "./pages/admin/AdminSlidesPage";
import AdminReservasPage from "./pages/admin/AdminReservasPage";
import AdminBloqueiosPage from "./pages/admin/AdminBloqueiosPage";
import AdminPacotesPage from "./pages/admin/AdminPacotesPage";
import AdminCategoriasPacotesPage from "./pages/admin/AdminCategoriasPacotesPage"; // NOVO IMPORT
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

// Componente Wrapper para aplicar o layout nas rotas
const LayoutWrapper = ({ element }: { element: React.ReactNode }) => (
  <MainLayout>{element}</MainLayout>
);

// Componente Wrapper para aplicar o layout Admin nas rotas
const AdminLayoutWrapper = ({ element }: { element: React.ReactNode }) => (
  <AdminRoute>
    <AdminLayout>{element}</AdminLayout>
  </AdminRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LayoutWrapper element={<Index />} />} />
            <Route path="/quem-somos" element={<LayoutWrapper element={<QuemSomos />} />} />
            <Route path="/acomodacoes" element={<LayoutWrapper element={<Acomodacoes />} />} />
            <Route path="/acomodacoes/:slug" element={<LayoutWrapper element={<AcomodacaoDetalhe />} />} />
            <Route path="/como-chegar" element={<LayoutWrapper element={<ComoChegar />} />} />
            <Route path="/galeria" element={<LayoutWrapper element={<Galeria />} />} />
            <Route path="/blog" element={<LayoutWrapper element={<Blog />} />} />
            <Route path="/contato" element={<LayoutWrapper element={<Contato />} />} />
            <Route path="/reserva" element={<LayoutWrapper element={<Reserva />} />} />
            
            {/* Rotas de Autenticação */}
            <Route path="/login" element={<LayoutWrapper element={<Login />} />} />
            <Route path="/criar-perfil" element={<LayoutWrapper element={<CriarPerfil />} />} />
            <Route path="/recuperar-senha" element={<LayoutWrapper element={<RecuperarSenha />} />} />
            
            {/* Rotas Protegidas (Usuário Comum) */}
            <Route path="/acompanhar-reserva" element={<LayoutWrapper element={<ProtectedRoute><AcompanharReserva /></ProtectedRoute>} />} />
            
            {/* Rotas Administrativas Protegidas (Usando AdminLayout e AdminRoute) */}
            <Route path="/admin" element={<AdminLayoutWrapper element={<AdminDashboard />} />} />
            <Route path="/admin/clientes" element={<AdminLayoutWrapper element={<AdminUsersPage />} />} />
            <Route path="/admin/acomodacoes" element={<AdminLayoutWrapper element={<AdminAcomodacoesPage />} />} />
            <Route path="/admin/comodidades" element={<AdminLayoutWrapper element={<AdminComodidadesPage />} />} />
            <Route path="/admin/pacotes" element={<AdminLayoutWrapper element={<AdminPacotesPage />} />} />
            <Route path="/admin/pacotes/categorias" element={<AdminLayoutWrapper element={<AdminCategoriasPacotesPage />} />} /> {/* NOVA ROTA */}
            <Route path="/admin/slides" element={<AdminLayoutWrapper element={<AdminSlidesPage />} />} />
            <Route path="/admin/reservas" element={<AdminLayoutWrapper element={<AdminReservasPage />} />} />
            <Route path="/admin/bloqueios" element={<AdminLayoutWrapper element={<AdminBloqueiosPage />} />} />
            <Route path="/admin/config" element={<AdminLayoutWrapper element={<AdminConfigPage />} />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;