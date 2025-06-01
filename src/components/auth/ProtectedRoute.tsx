
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, error } = useAuth();
  const location = useLocation();
  const [showTimeout, setShowTimeout] = useState(false);

  // Timeout simples para mostrar opções se carregamento demorar
  useEffect(() => {
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, 8000); // 8 segundos

      return () => clearTimeout(timeoutId);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading]);

  const handleReload = () => {
    window.location.reload();
  };

  // Se há erro, mostra tela de erro
  if (error && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md mx-auto text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Erro de Autenticação</h2>
          <p className="text-blue-200 mb-6">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Tentar Novamente
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="border-blue-300 text-blue-300 hover:bg-blue-800/30"
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se ainda carregando mas passou do timeout
  if (isLoading && showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md mx-auto text-center">
          <AlertCircle size={48} className="text-yellow-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Carregamento Lento</h2>
          <p className="text-blue-200 mb-6">
            O sistema está demorando para carregar. Verifique sua conexão.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Recarregar
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline"
              className="border-blue-300 text-blue-300 hover:bg-blue-800/30"
            >
              Voltar ao Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Se ainda carregando normalmente
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 border-4 border-blue-200/30 rounded-full animate-spin border-t-blue-400 mx-auto"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Hoppe</h2>
          <p className="text-blue-200 text-lg animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }
  
  // Se não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se está logado, mostra o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
