"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useWallet } from "./WalletProvider";
import { AuthRequired } from "../components/auth-required";

// List of protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/portfolio",
  "/bets/my-bets",
  "/my-tokens",
  "/hedgebots",
  "/watchlist",
  "/settings",
  "/launch",
  "/bets/create",
];

// Routes that should be accessible without authentication
const PUBLIC_ROUTES = [
  "/",
  "/marketcap",
  "/marketplace",
  "/bets",
  "/trading",
  "/communities",
];

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const { isAuthenticated } = useWallet();
  const [showAuthRequired, setShowAuthRequired] = useState(false);

  useEffect(() => {
    // Check if the current route requires authentication
    const requiresAuth = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // If the route requires auth and user is not authenticated, show auth required component
    if (requiresAuth && (!isConnected || !isAuthenticated)) {
      console.log("Access denied: Authentication required");
      setShowAuthRequired(true);
    } else {
      setShowAuthRequired(false);
    }
  }, [pathname, isConnected, isAuthenticated, router]);

  // If authentication is required but user is not authenticated, show auth required component
  if (showAuthRequired) {
    return <AuthRequired />;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
