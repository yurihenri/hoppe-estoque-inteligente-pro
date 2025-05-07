
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  BarChart, 
  Package, 
  Tag, 
  Bell, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usuarioLogado } from "@/mockData";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border bg-card transition-all duration-300",
        expanded ? "w-64" : "w-20",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {expanded ? (
          <h1 className="text-xl font-bold text-hoppe-700">Hoppe</h1>
        ) : (
          <h1 className="text-xl font-bold text-hoppe-700">H</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Usuário logado */}
      <div className="flex items-center p-4 border-b border-border">
        <div className="h-10 w-10 rounded-full bg-hoppe-200 flex items-center justify-center text-hoppe-700 font-semibold">
          {usuarioLogado.nome.substring(0, 2).toUpperCase()}
        </div>
        {expanded && (
          <div className="ml-3 overflow-hidden">
            <p className="font-medium text-sm truncate">{usuarioLogado.nome}</p>
            <p className="text-xs text-muted-foreground truncate">{usuarioLogado.cargo}</p>
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-hide">
        <NavItem to="/" icon={<BarChart size={20} />} label="Dashboard" expanded={expanded} />
        <NavItem to="/produtos" icon={<Package size={20} />} label="Produtos" expanded={expanded} />
        <NavItem to="/categorias" icon={<Tag size={20} />} label="Categorias" expanded={expanded} />
        <NavItem to="/alertas" icon={<Bell size={20} />} label="Alertas" expanded={expanded} />
        <NavItem to="/relatorios" icon={<FileText size={20} />} label="Relatórios" expanded={expanded} />
        <NavItem to="/configuracoes" icon={<Settings size={20} />} label="Configurações" expanded={expanded} />
      </nav>

      {/* Rodapé */}
      <div className="p-2 mt-auto border-t border-border">
        <Button variant="ghost" className="w-full justify-start" size="sm">
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
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-foreground hover:bg-hoppe-50 hover:text-hoppe-700",
        to === window.location.pathname && "bg-hoppe-50 text-hoppe-700"
      )}
    >
      <span className="mr-3">{icon}</span>
      {expanded && <span className="font-medium">{label}</span>}
    </Link>
  );
};

export default Sidebar;
