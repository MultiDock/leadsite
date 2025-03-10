"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AuthLayout from "@/components/auth-layout"

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return
    }

    setLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Show success message
      setSubmitted(true)
    } catch (error) {
      console.error("Password reset request failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 lg:hidden">
            <Package className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Resetowanie hasła</CardTitle>
          <CardDescription>
            {!submitted
              ? "Wprowadź swój adres email, aby zresetować hasło"
              : "Sprawdź swoją skrzynkę email, aby zresetować hasło"}
          </CardDescription>
        </CardHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter className="flex flex-col pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  "Zresetuj hasło"
                )}
              </Button>

              <div className="mt-4 text-center text-sm">
                <Link href="/login" className="text-primary hover:underline flex items-center justify-center">
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Powrót do logowania
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4 text-center">
            <div className="flex justify-center my-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p>
              Wysłaliśmy link do resetowania hasła na adres <strong>{email}</strong>. Sprawdź swoją skrzynkę email i
              kliknij link, aby zresetować hasło.
            </p>
            <p className="text-sm text-muted-foreground">
              Jeśli nie otrzymałeś emaila, sprawdź folder spam lub spróbuj ponownie.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.push("/login")}>
              Powrót do logowania
            </Button>
          </CardContent>
        )}
      </Card>
    </AuthLayout>
  )
}

