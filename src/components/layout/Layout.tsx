import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BottomNav />
      <main className="flex-1 pt-14 pb-20">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
