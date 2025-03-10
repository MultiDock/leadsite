"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run this check on the client side and when auth is not loading
    if (isClient && !loading) {
      if (!user) {
        router.push("/login")
      } else if (adminOnly && user.role !== "admin") {
        router.push("/") // Redirect non-admin users to dashboard
      }
    }
  }, [user, loading, router, adminOnly, isClient])

  // Don't render anything during SSR for protected routes
  if (!isClient) {
    return null
  }

  // Show loading spinner while checking authentication
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If admin-only and user is not admin
  if (adminOnly && user.role !== "admin") {
    return null
  }

  return <>{children}</>
}

