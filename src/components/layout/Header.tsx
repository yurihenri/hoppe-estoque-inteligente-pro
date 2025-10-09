
import React from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AlertsPopover } from "./AlertsPopover";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <AlertsPopover />
      </div>
    </header>
  );
};

export default Header;
