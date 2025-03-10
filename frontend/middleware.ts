import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List of routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/chatbot",
  "/watchlist",
  "/settings",
  "/launch",
  "/bets",
];

export function middleware(request: NextRequest) {
  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // If it's not a protected route, allow the request to proceed
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Check for authentication using various methods
  // 1. Our custom isAuthenticated cookie
  // 2. RainbowKit/wagmi connection cookies
  const isAuthenticated =
    request.cookies.get("isAuthenticated")?.value === "true" ||
    request.cookies.get("wagmi.connected")?.value === "true" ||
    request.cookies.get("wagmi.wallet")?.value !== undefined ||
    request.cookies.get("siwe")?.value !== undefined;

  // If not authenticated and trying to access a protected route, redirect to the home page
  if (!isAuthenticated) {
    const redirectUrl = new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chatbot/:path*",
    "/watchlist/:path*",
    "/settings/:path*",
    "/launch/:path*",
    "/bets/:path*",
  ],
};
