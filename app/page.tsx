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
import { fetchAvailableLeads } from "@/lib/leads-api"
import { NewTag } from "@/components/new-tag"
import Link from "next/link"
import type { Lead } from "@/types/lead"

export default function Dashboard() {
  const [expandedLeads, setExpandedLeads] = useState<Record<string, boolean>>({})
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("marketplace")

  useEffect(() => {
    async function loadLeads() {
      try {
        setLoading(true)
        const data = await fetchAvailableLeads()
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

  // Check if a lead is new (less than 24 hours old)
  const isNewLead = (date: string) => {
    const leadDate = new Date(date)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - leadDate.getTime())
    const diffHours = diffTime / (1000 * 60 * 60)
    return diffHours < 24
  }

  // Function to render a lead card
  const renderLeadCard = (lead: Lead, isPurchased = false) => (
    <Card key={lead.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{lead.type}</CardTitle>
            {!isPurchased && isNewLead(lead.date) && <NewTag />}
          </div>
          <Badge variant={lead.score >= 80 ? "default" : "secondary"}>{lead.score}%</Badge>
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

        {/* Always show contact details for purchased leads */}
        {(expandedLeads[lead.id] || isPurchased) && (
          <div className="mt-3 space-y-2 rounded-md bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Email:</span>
              <span>{lead.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Telefon:</span>
              <span>{lead.phone}</span>
            </div>
            {isPurchased && lead.order_number && (
              <div className="flex justify-between">
                <span className="font-medium">Nr zamówienia:</span>
                <span>{lead.order_number}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {!isPurchased ? (
          <>
            <Button variant="outline" size="sm" onClick={() => toggleLead(lead.id)}>
              {expandedLeads[lead.id] ? "Ukryj Szczegóły" : "Pokaż Szczegóły"}
            </Button>
            <PurchaseLeadButton
  leadId={lead.id}
  price={lead.price}
  lead={lead}
  onSuccess={() => {
    // Remove the lead from the available leads list
    setLeads(prevLeads => prevLeads.filter(l => l.id !== lead.id));
    
    // Switch to purchased tab after successful purchase
    setActiveTab("purchased");
  }}
/>
          </>
        ) : (
          <Button variant="outline" size="sm" className="w-full">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Zakupiono za {lead.price} monet
          </Button>
        )}
      </CardFooter>
    </Card>
  )

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
              <Link href="/">
                <Button variant="ghost" className="justify-start gap-2">
                  <Home className="h-4 w-4" />
                  Pulpit
                </Button>
              </Link>
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
                <Link href="/buy-coins">
                  <Button size="sm">Kup Monety</Button>
                </Link>
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
                    <div className="text-2xl font-bold">{leads.length}</div>
                    <p className="text-xs text-muted-foreground">Aktualizowane na bieżąco</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Zakupione Leady</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.purchasedLeads?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      {user?.purchasedLeads?.length && user.purchasedLeads.length > 0
                        ? `Ostatni zakup: ${user.purchasedLeads[0].date}`
                        : "Brak zakupionych leadów"}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Współczynnik Konwersji</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24.5%</div>
                    <p className="text-xs text-muted-foreground">Średnia dla wszystkich leadów</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pozostałe Monety</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.coins || 0}</div>
                    <Link href="/buy-coins">
                      <Button size="sm" className="mt-2 w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Kup Więcej
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="marketplace">Giełda Leadów</TabsTrigger>
                  <TabsTrigger value="purchased">
                    Zakupione Leady
                    {user?.purchasedLeads?.length ? (
                      <Badge variant="secondary" className="ml-2">
                        {user.purchasedLeads.length}
                      </Badge>
                    ) : null}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="marketplace" className="space-y-4">
                  {loading ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : leads.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {leads.map((lead) => renderLeadCard(lead))}
                    </div>
                  ) : (
                    <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                      <Package className="mx-auto h-8 w-8 opacity-50" />
                      <h3 className="mt-3 text-lg font-medium">Brak dostępnych leadów</h3>
                      <p className="mt-1">Sprawdź ponownie później lub skontaktuj się z administratorem.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="purchased">
                  {user?.purchasedLeads?.length ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {user.purchasedLeads.map((lead) => renderLeadCard(lead, true))}
                    </div>
                  ) : (
                    <div className="rounded-md border bg-card p-8 text-center text-muted-foreground">
                      <Package className="mx-auto h-8 w-8 opacity-50" />
                      <h3 className="mt-3 text-lg font-medium">Brak zakupionych leadów</h3>
                      <p className="mt-1">Kup leady z giełdy, aby zobaczyć je tutaj.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

