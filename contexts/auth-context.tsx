"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import type { Lead } from "@/types/lead"
import { purchaseLead as purchaseLeadApi, fetchPurchasedLeads } from "@/lib/leads-api"

type UserProfile = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  coins: number
  purchasedLeads?: Lead[]
}

interface AuthContextType {
  user: UserProfile | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loading: boolean
  purchaseLead: (lead: Lead) => Promise<boolean>
  updateUser: (updatedUser: UserProfile) => void
  refreshPurchasedLeads: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch user profile data
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) throw error

      // Fetch purchased leads
      const purchasedLeads = await fetchPurchasedLeads(userId)

      return {
        id: data.id,
        name: data.name,
        email: data.email || "",
        role: data.role,
        coins: data.coins,
        purchasedLeads: purchasedLeads,
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      return null
    }
  }

  // Refresh purchased leads
  const refreshPurchasedLeads = async () => {
    if (!user) return
    
    try {
      const purchasedLeads = await fetchPurchasedLeads(user.id)
      setUser(prev => {
        if (!prev) return null
        return {
          ...prev,
          purchasedLeads
        }
      })
    } catch (error) {
      console.error("Error refreshing purchased leads:", error)
    }
  }

  // Update user function
  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser)
  }

  // Check if user is logged in on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          if (profile) {
            setUser({
              ...profile,
              email: session.user.email || "",
            })
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        if (profile) {
          setUser({
            ...profile,
            email: session.user.email || "",
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return false
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id)
        if (profile) {
          setUser({
            ...profile,
            email: data.user.email || "",
          })
          toast.success("Zalogowano pomyślnie")
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Wystąpił błąd podczas logowania")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
  
      if (error) {
        toast.error(error.message);
        return false;
      }
  
      toast.success("Registration successful! Please check your email for confirmation.");
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      router.push("/login")
      toast.info("Wylogowano pomyślnie")
    } catch (error) {
      console.error("Logout failed:", error)
      toast.error("Wystąpił błąd podczas wylogowywania")
    }
  }

  // Purchase lead function
  // In your purchaseLead function in AuthProvider
// In your AuthProvider component
const purchaseLead = async (lead: Lead): Promise<boolean> => {
  if (!user) return false;

  // Check if user has enough coins
  if (user.coins < lead.price) {
    toast.error("Niewystarczająca liczba monet", {
      description: "Doładuj swoje konto, aby kupić ten lead",
    });
    return false;
  }

  setLoading(true);
  try {
    const result = await purchaseLeadApi(lead.id, user.id, lead.price);

    if (!result.success) {
      throw new Error("Failed to purchase lead");
    }

    // Define updatedLead with the correct type
    const updatedLead: Lead = {
      ...lead,
      order_number: result.order_number || `ORD-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: "sold" // Mark the lead as sold
    };
    
    // Now use updatedLead in the setUser function
    setUser((prevUser: UserProfile | null): UserProfile | null => {
      if (!prevUser) return null;
      
      return {
        ...prevUser,
        coins: prevUser.coins - lead.price,
        purchasedLeads: [updatedLead, ...(prevUser.purchasedLeads || [])]
      };
    });

    // Force refresh purchased leads from the server
    await refreshPurchasedLeads();
    
    // Force router refresh to update the UI
    router.refresh();

    toast.success("Lead zakupiony pomyślnie", {
      description: "Możesz teraz zobaczyć szczegóły w zakładce Zakupione Leady",
    });

    return true;
  } catch (error) {
    console.error("Failed to purchase lead:", error);
    toast.error("Wystąpił błąd podczas zakupu leada");
    return false;
  } finally {
    setLoading(false);
  }
};

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      purchaseLead,
      updateUser,
      refreshPurchasedLeads
    }}>
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