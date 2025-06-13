
import React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useValidityAlerts } from "@/hooks/useValidityAlerts";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { totalAlerts, isLoading } = useValidityAlerts();

  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" className="relative bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50">
          <Bell size={20} />
          {!isLoading && totalAlerts > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-600"
              variant="destructive"
            >
              {totalAlerts}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
