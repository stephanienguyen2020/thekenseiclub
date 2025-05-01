"use client";

import "./globals.css";
import { ClientProviders } from "./client-providers";
import { ThemeProvider } from "next-themes";
import { AuthGuard } from "./providers/AuthGuard";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AuthGuard>{children}</AuthGuard>
          </ThemeProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
