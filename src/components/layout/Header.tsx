
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { mockAlertas } from "@/mockData";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const alertasNaoLidos = mockAlertas.filter((alerta) => !alerta.lida);

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <Button variant="outline" size="icon" className="relative">
          <Bell size={20} />
          {alertasNaoLidos.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              variant="destructive"
            >
              {alertasNaoLidos.length}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
