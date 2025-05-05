"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AuthRequired } from "../components/auth-required";
import { useCurrentAccount } from "@mysten/dapp-kit";

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
  const currentAccount = useCurrentAccount();
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if the current route requires authentication
    const requiresAuth = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    // Get stored wallet address
    const storedWalletAddress = localStorage.getItem("walletAddress");

    // If route requires auth and there's no current account or stored wallet
    if (requiresAuth && !currentAccount && !storedWalletAddress) {
      console.log("Access denied: Authentication required");
      setShowAuthRequired(true);
    } else {
      setShowAuthRequired(false);
    }

    // Set initializing to false after checking
    setIsInitializing(false);
  }, [pathname, currentAccount]);

  // Show nothing while initializing to prevent flash of content
  if (isInitializing) {
    return null;
  }

  // If authentication is required but user is not authenticated, show auth required component
  if (showAuthRequired) {
    return <AuthRequired />;
  }

  // Otherwise, render the children
  return <>{children}</>;
}
