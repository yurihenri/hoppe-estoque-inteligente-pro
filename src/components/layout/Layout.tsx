
import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { ValidityAlertPopup } from "@/components/alerts/ValidityAlertPopup";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ValidityAlertPopup />
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
