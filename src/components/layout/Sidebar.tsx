
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  BarChart, 
  Package, 
  Tag, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-[#0B1220] text-white transition-all duration-300",
        expanded ? "w-64" : "w-20",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-blue-900">
        {expanded ? (
          <h1 className="text-xl font-bold text-white">Hoppe</h1>
        ) : (
          <h1 className="text-xl font-bold text-white">H</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto text-white hover:bg-blue-900/50"
        >
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Usuário logado */}
      <div className="flex items-center p-4 border-b border-blue-900">
        <div className="h-10 w-10 rounded-full bg-blue-700/30 flex items-center justify-center text-white font-semibold">
          {user?.nome 
            ? user.nome.substring(0, 2).toUpperCase() 
            : user?.email?.substring(0, 2).toUpperCase() || "??"
          }
        </div>
        {expanded && (
          <div className="ml-3 overflow-hidden">
            <p className="font-medium text-sm truncate">{user?.nome || user?.email}</p>
            <p className="text-xs text-blue-200/70 truncate">{user?.cargo || "Usuário"}</p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
        <NavItem to="/dashboard" icon={<BarChart size={20} />} label="Dashboard" expanded={expanded} />
        <NavItem to="/produtos" icon={<Package size={20} />} label="Produtos" expanded={expanded} />
        <NavItem to="/categorias" icon={<Tag size={20} />} label="Categorias" expanded={expanded} />
        <NavItem to="/alertas" icon={<Bell size={20} />} label="Alertas" expanded={expanded} />
        <NavItem to="/relatorios" icon={<FileText size={20} />} label="Relatórios" expanded={expanded} />
        <NavItem to="/integracaoDados" icon={<Database size={20} />} label="Integração de Dados" expanded={expanded} />
        <NavItem to="/configuracoes" icon={<Settings size={20} />} label="Configurações" expanded={expanded} />
      </nav>

      {/* Rodapé */}
      <div className="p-2 mt-auto border-t border-blue-900">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-white hover:bg-blue-900/50" 
          size="sm" 
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          {expanded && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, expanded }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2.5 rounded-md text-white transition-colors",
        isActive 
          ? "bg-blue-700 text-white font-medium" 
          : "hover:bg-blue-900/50"
      )}
    >
      <span className="mr-3">{icon}</span>
      {expanded && <span className="font-medium">{label}</span>}
    </Link>
  );
};

export default Sidebar;
