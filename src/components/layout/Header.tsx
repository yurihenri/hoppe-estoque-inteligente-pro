
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alertas } from "@/mockData";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const alertasNaoLidos = alertas.filter((alerta) => !alerta.lido);

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-white">
      <h1 className="text-2xl font-semibold">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative">
          <Bell size={20} />
          {alertasNaoLidos.length > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-erro-600"
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
