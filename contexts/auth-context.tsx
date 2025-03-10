"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Lead = {
  id: string
  type: string
  interest: string
  location: string
  date: string
  email: string
  phone: string
  price: number
  addedBy?: string
}

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  coins: number
  purchasedLeads: Lead[]
} | null

interface AuthContextType {
  user: User
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  purchaseLead: (lead: Lead) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    // Only run this in the browser
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Mock login function - replace with actual API call
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication - in a real app, validate credentials with backend
      if (email === "admin@example.com" && password === "password") {
        const userData = {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin" as const,
          coins: 5000,
          purchasedLeads: [],
        }
        setUser(userData)

        // Only set localStorage in the browser
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData))
        }

        toast.success("Zalogowano pomyślnie")
        return true
      } else if (email === "user@example.com" && password === "password") {
        const userData = {
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          role: "user" as const,
          coins: 1250,
          purchasedLeads: [],
        }
        setUser(userData)

        // Only set localStorage in the browser
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(userData))
        }

        toast.success("Zalogowano pomyślnie")
        return true
      }

      toast.error("Nieprawidłowy email lub hasło")
      return false
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Wystąpił błąd podczas logowania")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Mock register function - replace with actual API call
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real app, send registration data to backend
      toast.success("Rejestracja zakończona pomyślnie")
      return true
    } catch (error) {
      console.error("Registration failed:", error)
      toast.error("Wystąpił błąd podczas rejestracji")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Function to purchase a lead
  const purchaseLead = async (lead: Lead): Promise<boolean> => {
    if (!user) return false

    // Check if user has enough coins
    if (user.coins < lead.price) {
      toast.error("Niewystarczająca liczba monet", {
        description: "Doładuj swoje konto, aby kupić ten lead",
      })
      return false
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user data with purchased lead and reduced coins
      const updatedUser = {
        ...user,
        coins: user.coins - lead.price,
        purchasedLeads: [...user.purchasedLeads, lead],
      }

      setUser(updatedUser)

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }

      toast.success("Lead zakupiony pomyślnie", {
        description: "Możesz teraz zobaczyć szczegóły w zakładce Zakupione Leady",
      })

      return true
    } catch (error) {
      console.error("Failed to purchase lead:", error)
      toast.error("Wystąpił błąd podczas zakupu leada")
      return false
    }
  }

  const logout = () => {
    setUser(null)

    // Only access localStorage in the browser
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }

    router.push("/login")
    toast.info("Wylogowano pomyślnie")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, purchaseLead }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

