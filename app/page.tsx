"use client"

import { useState, useEffect } from "react"
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  Menu,
  Package,
  PlusCircle,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PurchaseLeadButton } from "@/components/purchase-lead-button"
import ProtectedRoute from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

// Define the Lead interface
interface Lead {
  id: string
  type: string
  interest: string
  score: number
  location: string
  date: string
  email: string
  phone: string
  price: number
}

// Mock lead data
const mockLeads: Lead[] = [
  {
    id: "1",
    type: "E-commerce",
    interest: "Kosmetyki",
    score: 85,
    location: "Warszawa",
    date: "2024-01-20",
    email: "test1@example.com",
    phone: "123-456-789",
    price: 10,
  },
  {
    id: "2",
    type: "Usługi",
    interest: "Remonty",
    score: 70,
    location: "Kraków",
    date: "2024-01-15",
    email: "test2@example.com",
    phone: "987-654-321",
    price: 15,
  },
  {
    id: "3",
    type: "Szkolenia",
    interest: "Programowanie",
    score: 92,
    location: "Gdańsk",
    date: "2024-01-10",
    email: "test3@example.com",
    phone: "111-222-333",
    price: 20,
  },
  {
    id: "4",
    type: "Szkolenia",
    interest: "Programowanie",
    score: 92,
    location: "Gdańsk",
    date: "2024-01-10",
    email: "test3@example.com",
    phone: "111-222-333",
    price: 20,
  },
]

// Mock fetchLeads function
const fetchLeads = async (): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return mockLeads
}

export default function Dashboard() {
  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await fetchLeads()
        setLeads(data)
      } catch (error) {
        console.error("Failed to load leads:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLeads()
  }, [])

  const toggleLead = (id: string) => {
    setExpandedLeads((prev) => {
      // Create a new object to avoid modifying the previous state directly
      const newState = { ...prev }
      // Toggle only the specific lead's state
      newState[id] = !prev[id]
      return newState
    })
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        {/* Mobile Nav */}
        <div className="flex h-14 items-center border-b bg-background px-4 lg:h-[60px] lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Przełącz Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[280px]">
              <nav className="grid gap-2 text-sm">
                <Button variant="ghost" className="justify-start gap-2">
                  <Home className="h-4 w-4" />
                  Pulpit
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <Package className="h-4 w-4" />
                  Leady
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Marketplace
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Analityka
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <CreditCard className="h-4 w-4" />
                  Płatności
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <Users className="h-4 w-4" />
                  Zespół
                </Button>
                <Button variant="ghost" className="justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Ustawienia
                </Button>
                {user?.role === "admin" && (
                  <Link href="/admin/leads">
                    <Button variant="ghost" className="justify-start gap-2 w-full">
                      <Package className="h-4 w-4" />
                      Zarządzaj Leadami
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={logout}>
                  Wyloguj się
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <span className="font-semibold">LeadMarket</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="hidden w-[240px] flex-col border-r bg-background lg:flex">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <span className="font-semibold">LeadMarket</span>
              </div>
            </div>
            <nav className="grid gap-2 p-4 text-sm">
              <Button variant="ghost" className="justify-start gap-2">
                <Home className="h-4 w-4" />
                Pulpit
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Package className="h-4 w-4" />
                Leady
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <ShoppingCart className="h-4 w-4" />
                Marketplace
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                Analityka
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Płatności
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Users className="h-4 w-4" />
                Zespół
              </Button>
              <Button variant="ghost" className="justify-start gap-2">
                <Settings className="h-4 w-4" />
                Ustawienia
              </Button>
              {user?.role === "admin" && (
                <Link href="/admin/leads">
                  <Button variant="ghost" className="justify-start gap-2 w-full">
                    <Package className="h-4 w-4" />
                    Zarządzaj Leadami
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={logout}>
                Wyloguj się
              </Button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex flex-1 flex-col">
            <div className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
              <div className="flex-1">
                <h1 className="text-lg font-semibold">Pulpit</h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{user?.coins || 0} monet</span>
                </div>
                <Button size="sm">Kup Monety</Button>
              </div>
            </div>

            <div className="flex-1 space-y-4 p-4 md:p-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold">Witaj, {user?.name || "Użytkowniku"}</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dostępne Leady</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,245</div>
                    <p className="text-xs text-muted-foreground">+180 od zeszłego tygodnia</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Zakupione Leady</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">324</div>
                    <p className="text-xs text-muted-foreground">+56 od zeszłego tygodnia</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Współczynnik Konwersji</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24.5%</div>
                    <p className="text-xs text-muted-foreground">+2.3% od zeszłego miesiąca</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pozostałe Monety</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.coins || 0}</div>
                    <Button size="sm" className="mt-2 w-full">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Kup Więcej
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="marketplace" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="marketplace">Giełda Leadów</TabsTrigger>
                  <TabsTrigger value="purchased">Zakupione Leady</TabsTrigger>
                </TabsList>
                <TabsContent value="marketplace" className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {leads.map((lead) => (
                        <Card key={lead.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{lead.type}</CardTitle>
                              <Badge variant="secondary">{lead.score}%</Badge>
                            </div>
                            <CardDescription>{lead.interest}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Lokalizacja:</span>
                              <span>{lead.location}</span>
                            </div>
                            <div className="mt-1 flex justify-between text-sm">
                              <span className="text-muted-foreground">Dodano:</span>
                              <span>{lead.date}</span>
                            </div>

                            {expandedLeads[lead.id] && (
                              <div className="mt-3 space-y-2 rounded-md bg-muted p-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">Email:</span>
                                  <span>{lead.email}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Telefon:</span>
                                  <span>{lead.phone}</span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between pt-2">
                            <Button variant="outline" size="sm" onClick={() => toggleLead(lead.id)}>
                              {expandedLeads[lead.id] ? "Ukryj Szczegóły" : "Pokaż Szczegóły"}
                            </Button>
                            <PurchaseLeadButton
                              leadId={lead.id}
                              price={lead.price}
                              onSuccess={() => {
                                // Handle successful purchase, maybe refresh the leads list
                              }}
                            />
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="purchased">
                  <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                    <Package className="mx-auto h-8 w-8 opacity-50" />
                    <h3 className="mt-3 text-lg font-medium">Brak zakupionych leadów</h3>
                    <p className="mt-1">Kup leady z giełdy, aby zobaczyć je tutaj.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

