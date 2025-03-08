import { monaSans } from "./fonts";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import "./globals.css";
import type React from "react"; // Import React

export const metadata = {
  title: "HyperSonic",
  description: "One-stop shop for all your meme coin needs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          monaSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
