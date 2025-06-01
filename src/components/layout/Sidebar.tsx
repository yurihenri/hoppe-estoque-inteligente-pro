
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
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const menuItems = [
    { to: "/dashboard", icon: BarChart, label: "Dashboard" },
    { to: "/produtos", icon: Package, label: "Produtos" },
    { to: "/categorias", icon: Tag, label: "Categorias" },
    { to: "/alertas", icon: Bell, label: "Alertas" },
    { to: "/relatorios", icon: FileText, label: "Relatórios" },
    { to: "/integracaoDados", icon: Database, label: "Integração de Dados" },
    { to: "/configuracoes", icon: Settings, label: "Configurações" },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-800 text-white transition-all duration-300 shadow-2xl border-r border-blue-800/30",
        expanded ? "w-64" : "w-20",
        className
      )}
    >
      {/* Header com logo e toggle */}
      <div className="flex items-center justify-between p-4 border-b border-blue-800/30 bg-black/20">
        {expanded ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-bold text-white">Hoppe</h1>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-lg">H</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="text-blue-200 hover:text-white hover:bg-blue-800/30 transition-colors"
        >
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Informações do usuário */}
      <div className="flex items-center p-4 border-b border-blue-800/30 bg-black/10">
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {user?.nome 
            ? user.nome.substring(0, 2).toUpperCase() 
            : user?.email?.substring(0, 2).toUpperCase() || "??"
          }
        </div>
        {expanded && (
          <div className="ml-3 overflow-hidden flex-1">
            <p className="font-medium text-sm truncate text-white">
              {user?.nome || user?.email}
            </p>
            <p className="text-xs text-blue-300 truncate">
              {user?.cargo || "Usuário"}
            </p>
          </div>
        )}
      </div>

      {/* Menu de navegação */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => (
          <NavItem 
            key={item.to}
            to={item.to} 
            icon={<item.icon size={20} />} 
            label={item.label} 
            expanded={expanded}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* Rodapé com logout */}
      <div className="p-2 border-t border-blue-800/30 bg-black/10">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full text-blue-200 hover:text-white hover:bg-red-600/20 transition-all duration-200",
            expanded ? "justify-start" : "justify-center"
          )}
          size="sm" 
          onClick={handleLogout}
        >
          <LogOut size={20} className={expanded ? "mr-3" : ""} />
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
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, expanded, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2.5 rounded-lg text-blue-200 hover:text-white transition-all duration-200 group",
        isActive 
          ? "bg-blue-600 text-white shadow-lg transform scale-[1.02]" 
          : "hover:bg-blue-800/30",
        expanded ? "justify-start" : "justify-center"
      )}
    >
      <span className={cn(
        "transition-transform duration-200",
        !expanded && "group-hover:scale-110"
      )}>
        {icon}
      </span>
      {expanded && (
        <span className="ml-3 font-medium text-sm truncate">
          {label}
        </span>
      )}
      {/* Indicador visual para item ativo quando collapsed */}
      {!expanded && isActive && (
        <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full"></div>
      )}
    </Link>
  );
};

export default Sidebar;
