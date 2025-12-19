import React from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "./Header";
import { MadeWithDyad } from "../made-with-dyad";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      {/* O flex-row é aplicado apenas em telas md e maiores */}
      <div className="flex flex-1 pt-16"> {/* pt-16 para compensar o header fixo */}
        {/* Sidebar visível apenas em telas médias e maiores */}
        <div className="hidden md:block">
            <AdminSidebar />
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default AdminLayout;