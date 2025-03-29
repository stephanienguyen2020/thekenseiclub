"use client";

import { ReactNode, useEffect } from "react";
import { MetaMaskProvider } from "@metamask/sdk-react";

interface MetaMaskSDKProviderProps {
  children: ReactNode;
}

export function MetaMaskSDKProvider({ children }: MetaMaskSDKProviderProps) {
  // Log when provider mounts to help with debugging
  useEffect(() => {
    console.log("MetaMaskSDKProvider mounted");

    // Log if window.ethereum is available
    if (typeof window !== "undefined") {
      console.log("window.ethereum available:", !!window.ethereum);
    }
  }, []);

  // MetaMask SDK configuration options
  const options = {
    // Specify the app's name for MetaMask UI
    dappMetadata: {
      name: "Hypersonic",
      url: typeof window !== "undefined" ? window.location.href : "",
    },
    // Show logs for debugging in development
    logging: {
      developerMode: process.env.NODE_ENV !== "production",
    },
    // Don't check for installation immediately to avoid popups on page load
    checkInstallationImmediately: false,
    // Setting this to true helps with some popup handling
    forceInjectProvider: false,
    // Connect with fast settings - this helps when clicking buttons multiple times
    preferDesktopMode: false,
  };

  return (
    <MetaMaskProvider
      debug={process.env.NODE_ENV !== "production"}
      sdkOptions={options}
    >
      {children}
    </MetaMaskProvider>
  );
}
