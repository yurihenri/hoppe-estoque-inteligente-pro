
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Layout from "@/components/layout/Layout";

// Lazy imports para otimização
import {
  Dashboard,
  Produtos,
  Categorias,
  Relatorios,
  Alertas,
  IntegracaoDados,
  Configuracoes,
  Planos
} from "@/components/routing/LazyComponents";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading component otimizado
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded w-48 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout title="Dashboard">
                    <Suspense fallback={<PageLoader />}>
                      <Dashboard />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/produtos" element={
                <ProtectedRoute>
                  <Layout title="Produtos">
                    <Suspense fallback={<PageLoader />}>
                      <Produtos />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/categorias" element={
                <ProtectedRoute>
                  <Layout title="Categorias">
                    <Suspense fallback={<PageLoader />}>
                      <Categorias />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute>
                  <Layout title="Relatórios">
                    <Suspense fallback={<PageLoader />}>
                      <Relatorios />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/alertas" element={
                <ProtectedRoute>
                  <Layout title="Alertas">
                    <Suspense fallback={<PageLoader />}>
                      <Alertas />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/integracao-dados" element={
                <ProtectedRoute>
                  <Layout title="Integração de Dados">
                    <Suspense fallback={<PageLoader />}>
                      <IntegracaoDados />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute>
                  <Layout title="Configurações">
                    <Suspense fallback={<PageLoader />}>
                      <Configuracoes />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/planos" element={
                <ProtectedRoute>
                  <Layout title="Planos">
                    <Suspense fallback={<PageLoader />}>
                      <Planos />
                    </Suspense>
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
