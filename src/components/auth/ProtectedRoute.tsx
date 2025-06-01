
import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // If we're still loading, show a professional loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-blue-200 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Hoppe</h2>
            <p className="text-blue-200">Carregando seu painel...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If the user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in, show the protected route
  return <>{children}</>;
};

export default ProtectedRoute;
