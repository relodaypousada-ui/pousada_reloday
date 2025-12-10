import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { MadeWithDyad } from "../made-with-dyad";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <MadeWithDyad />
    </div>
  );
};

export default MainLayout;