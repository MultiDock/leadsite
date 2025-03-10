"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Package, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AuthLayout from "@/components/auth-layout"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const { register, loading } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, acceptTerms: checked }))

    // Clear error when user checks
    if (errors.acceptTerms) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.acceptTerms
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Imię jest wymagane"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email jest wymagany"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Nieprawidłowy format email"
    }

    if (!formData.password) {
      newErrors.password = "Hasło jest wymagane"
    } else if (formData.password.length < 8) {
      newErrors.password = "Hasło musi mieć co najmniej 8 znaków"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są identyczne"
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "Musisz zaakceptować regulamin"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    try {
      const success = await register(formData.name, formData.email, formData.password)
      if (success) {
        router.push("/login?registered=true")
      } else {
        toast.error("Nie udało się zarejestrować. Spróbuj ponownie.")
      }
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error("Wystąpił błąd podczas rejestracji. Spróbuj ponownie.")
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 lg:hidden">
            <Package className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">Utwórz konto</CardTitle>
          <CardDescription>Wprowadź swoje dane, aby utworzyć konto</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Imię i nazwisko</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jan Kowalski"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jan@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
              {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={handleCheckboxChange}
                disabled={loading}
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Akceptuję{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  regulamin
                </Link>{" "}
                i{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  politykę prywatności
                </Link>
              </label>
            </div>
            {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms}</p>}
          </CardContent>

          <CardFooter className="flex flex-col pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejestracja...
                </>
              ) : (
                "Zarejestruj się"
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
      </Card>
    </AuthLayout>
  )
}

