
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Alertas from "./pages/Alertas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import IntegracaoDados from "./pages/IntegracaoDados";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root route - redireciona para dashboard */}
            <Route 
              path="/" 
              element={<Navigate to="/dashboard" replace />}
            />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/produtos" 
              element={
                <ProtectedRoute>
                  <Produtos />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/categorias" 
              element={
                <ProtectedRoute>
                  <Categorias />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/alertas" 
              element={
                <ProtectedRoute>
                  <Alertas />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/relatorios" 
              element={
                <ProtectedRoute>
                  <Relatorios />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/integracaoDados" 
              element={
                <ProtectedRoute>
                  <IntegracaoDados />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/configuracoes" 
              element={
                <ProtectedRoute>
                  <Configuracoes />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
