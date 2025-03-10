"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Package, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthLayout from "@/components/auth-layout"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loading, user } = useAuth()

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }

    // Check if user just registered
    const registered = searchParams.get("registered")
    if (registered === "true") {
      toast.success("Rejestracja zakończona pomyślnie", {
        description: "Możesz teraz zalogować się na swoje konto",
      })
    }
  }, [user, router, searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const success = await login(email, password)
      if (success) {
        router.push("/")
      } else {
        setError("Nieprawidłowy email lub hasło")
      }
    } catch (error) {
      console.error("Login failed:", error)
      setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.")
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 lg:hidden">
            <Package className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Zaloguj się</CardTitle>
          <CardDescription>Wprowadź swoje dane, aby uzyskać dostęp do platformy</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <div className="text-sm">
                <Link href="/reset-password" className="text-primary hover:underline">
                  Zapomniałeś hasła?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logowanie...
                </>
              ) : (
                "Zaloguj się"
              )}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Nie masz konta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Zarejestruj się
              </Link>
            </p>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              <p>Demo credentials:</p>
              <p>Admin: admin@example.com / password</p>
              <p>User: user@example.com / password</p>
            </div>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  )
}

