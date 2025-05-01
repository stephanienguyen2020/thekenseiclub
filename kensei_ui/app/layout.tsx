"use client";

import "./globals.css";
import { Providers } from "./providers";
import { ClientProviders } from "./client-providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ClientProviders>
          <Providers>{children}</Providers>
        </ClientProviders>
      </body>
    </html>
  );
}
