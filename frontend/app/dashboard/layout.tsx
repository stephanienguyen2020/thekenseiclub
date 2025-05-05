"use client"

import type React from "react"
import { Suspense } from "react"
import DashboardSidebar from "@/components/dashboard/sidebar"
import Navbar from "@/components/navbar"

// Simple loading component
function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-12 h-12 border-4 border-t-[#c0ff00] border-r-[#c0ff00] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
    </div>
  )
}

// Error boundary fallback
function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
      <div className="bg-red-100 border-4 border-red-500 rounded-xl p-6 max-w-md">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Something went wrong</h2>
        <p className="mb-4">We're having trouble loading this page. Please try refreshing.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-500 text-white px-4 py-2 rounded-xl font-bold border-2 border-black"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0039C6]">
      {/* Keep the main navbar */}
      <Navbar isAuthenticated={true} />

      <div className="flex">
        <Suspense fallback={<Loading />}>
          <DashboardSidebar />
        </Suspense>
        <div className="flex-1 overflow-auto">
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </div>
      </div>
    </div>
  )
}
