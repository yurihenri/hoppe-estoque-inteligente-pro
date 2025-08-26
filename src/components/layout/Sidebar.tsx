
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  BarChart3, 
  Bell, 
  Database, 
  Settings,
  Crown,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PlanBadge } from '@/components/plans/PlanBadge';
import { usePlans } from '@/hooks/usePlans';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const { currentPlan } = usePlans();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Produtos', path: '/produtos' },
    { icon: Tags, label: 'Categorias', path: '/categorias' },
    { icon: BarChart3, label: 'Relatórios', path: '/relatorios' },
    { icon: Bell, label: 'Alertas', path: '/alertas' },
    { icon: Database, label: 'Integração', path: '/integracao-dados' },
    { icon: Crown, label: 'Planos', path: '/planos' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold text-hoppe-600">Hoppe</h1>
            {currentPlan && (
              <PlanBadge plan={currentPlan} className="mt-1" />
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-hoppe-100 text-hoppe-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900">{user.nome}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={`w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}
        >
          <LogOut size={16} />
          {!isCollapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>

      {/* Powered by Hoppe */}
      {!currentPlan?.features.remove_branding && !isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">Powered by Hoppe</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
