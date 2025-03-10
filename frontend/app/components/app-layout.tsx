"use client";

import { ReactNode, useEffect, useState } from "react";
import { SiteHeader } from "./site-header";
import { SiteLeftbar } from "./site-leftbar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export function AppLayout({ children, showFooter = false }: AppLayoutProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const savedAuth = localStorage.getItem("isAuthenticated");
      setIsAuthenticated(savedAuth === "true");
    };

    // Check on initial load
    checkAuth();

    // Listen for storage changes (for cross-tab synchronization)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <SiteHeader />
      </div>

      {/* Main content area with sidebar */}
      <div className="flex pt-16 flex-grow">
        {/* Left Sidebar - only shown when authenticated */}
        {isAuthenticated && (
          <div className="fixed top-16 left-0 bottom-0 z-40 w-[280px]">
            <SiteLeftbar />
          </div>
        )}

        {/* Main Content - adjust padding based on authentication status */}
        <main
          className={`flex-1 ${isAuthenticated ? "ml-[280px]" : ""} w-full`}
        >
          {children}

          {/* Footer */}
          {showFooter && <Footer />}
        </main>
      </div>
    </div>
  );
}
