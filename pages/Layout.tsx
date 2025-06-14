// components/Layout.tsx
import { ReactNode } from "react";
import Navigation from "./Navigation";
interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <main className="relative">
        {/* Background gradient overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />

        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
