
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

  // Timeout para mostrar mensagem de erro se carregamento for muito longo
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowTimeout(true);
      }, 10000); // 10 segundos para mostrar timeout
    } else {
      setShowTimeout(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  const handleReload = () => {
    window.location.reload();
  };

  // Se há erro de autenticação, mostra tela de erro
  if (error && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-6 text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-red-600" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Erro de Autenticação</h2>
            <p className="text-blue-200">{error}</p>
          </div>
          
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

  // Se ainda está carregando mas passou do timeout, mostra opção de erro
  if (isLoading && showTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-6 text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-yellow-600" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Carregamento Lento</h2>
            <p className="text-blue-200">
              O carregamento está demorando mais que o esperado. 
              Verifique sua conexão ou tente recarregar a página.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw size={16} className="mr-2" />
              Recarregar Página
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

  // Se ainda está carregando normalmente, mostra tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            <div className="h-20 w-20 border-4 border-blue-200/30 rounded-full animate-spin border-t-blue-400"></div>
            <div className="absolute inset-0 h-20 w-20 border-4 border-blue-500/20 rounded-full animate-ping"></div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Hoppe</h2>
            <p className="text-blue-200 text-lg font-medium animate-pulse">
              Carregando seu painel...
            </p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-xs text-blue-300 mt-4">
              Se o carregamento demorar, a página será recarregada automaticamente
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Se o usuário não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se o usuário está logado, mostra a rota protegida
  return <>{children}</>;
};

export default ProtectedRoute;
