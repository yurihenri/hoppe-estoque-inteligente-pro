
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Se ainda está carregando, mostra tela de loading profissional
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="relative">
            {/* Spinner principal */}
            <div className="h-20 w-20 border-4 border-blue-200/30 rounded-full animate-spin border-t-blue-400"></div>
            {/* Spinner secundário para efeito visual */}
            <div className="absolute inset-0 h-20 w-20 border-4 border-blue-500/20 rounded-full animate-ping"></div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white">Hoppe</h2>
            <p className="text-blue-200 text-lg font-medium animate-pulse">Carregando seu painel...</p>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
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
