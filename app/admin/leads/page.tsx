"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Trash2, ChevronLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import ProtectedRoute from "@/components/protected-route"
import { addLead, deleteLead } from "@/lib/leads-api"
import { supabase } from "@/lib/supabase"
import type { Lead } from "@/types/lead"

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [formData, setFormData] = useState<Omit<Lead, "id" | "date" | "status">>({
    type: "",
    interest: "",
    score: 80,
    location: "",
    email: "",
    phone: "",
    price: 10,
  })
  const [loading, setLoading] = useState(false)
  const [fetchingLeads, setFetchingLeads] = useState(true)
  const router = useRouter()

  // Fetch all leads (including sold ones) for admin
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setFetchingLeads(true)
        const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

        if (error) throw error

        const formattedLeads = data.map((lead) => ({
          ...lead,
          date: new Date(lead.created_at).toISOString().split("T")[0],
        }))

        setLeads(formattedLeads)
      } catch (error) {
        console.error("Error fetching leads:", error)
        toast.error("Nie udało się załadować leadów")
      } finally {
        setFetchingLeads(false)
      }
    }

    fetchLeads()

    // Set up real-time subscription for leads table
    const subscription = supabase
      .channel("leads-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, (payload) => {
        // Refresh leads when there's a change
        fetchLeads()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const filteredLeads = leads.filter(
    (lead) =>
      lead.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interest.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" || name === "price" ? Number(value) : value,
    }))
  }

  const handleAddLead = async () => {
    setLoading(true)
    try {
      const newLead = await addLead(formData)

      if (!newLead) {
        throw new Error("Failed to add lead")
      }

      setIsAddDialogOpen(false)
      setFormData({
        type: "",
        interest: "",
        score: 80,
        location: "",
        email: "",
        phone: "",
        price: 10,
      })

      toast.success("Lead dodany pomyślnie", {
        description: "Nowy lead został dodany do bazy danych.",
      })
    } catch (error) {
      console.error("Failed to add lead:", error)
      toast.error("Błąd", {
        description: "Nie udało się dodać leada. Spróbuj ponownie.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteLead = async () => {
    if (!selectedLead) return

    setLoading(true)
    try {
      const success = await deleteLead(selectedLead.id)

      if (!success) {
        throw new Error("Failed to delete lead")
      }

      setIsDeleteDialogOpen(false)
      setSelectedLead(null)

      toast.success("Lead usunięty", {
        description: "Lead został pomyślnie usunięty z bazy danych.",
      })
    } catch (error) {
      console.error("Failed to delete lead:", error)
      toast.error("Błąd", {
        description: "Nie udało się usunąć leada. Spróbuj ponownie.",
      })
    } finally {
      setLoading(false)
    }
  }

  const openDeleteDialog = (lead: Lead) => {
    setSelectedLead(lead)
    setIsDeleteDialogOpen(true)
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="container mx-auto py-6">
        <div className="mb-6 flex items-center">
          <Button variant="outline" size="sm" className="mr-4" onClick={() => router.push("/")}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Powrót do pulpitu
          </Button>
          <h1 className="text-2xl font-bold">Zarządzanie leadami</h1>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj leadów..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Dodaj nowy lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Dodaj nowy lead</DialogTitle>
                <DialogDescription>Wypełnij poniższy formularz, aby dodać nowy lead do systemu.</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Typ</Label>
                    <Input
                      id="type"
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      placeholder="np. E-commerce"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="interest">Zainteresowanie</Label>
                    <Input
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleInputChange}
                      placeholder="np. Kosmetyki"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Ocena (1-100)</Label>
                    <Input
                      id="score"
                      name="score"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.score}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Cena (monety)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      min="1"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Lokalizacja</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="np. Warszawa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="np. klient@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="np. 123-456-789"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleAddLead} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dodawanie...
                    </>
                  ) : (
                    "Dodaj lead"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Wszystkie leady</CardTitle>
            <CardDescription>
              Zarządzaj leadami dostępnymi w systemie. Możesz dodawać, edytować i usuwać leady.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingLeads ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Zainteresowanie</TableHead>
                    <TableHead>Ocena</TableHead>
                    <TableHead>Lokalizacja</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cena</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{lead.type}</TableCell>
                        <TableCell>{lead.interest}</TableCell>
                        <TableCell>
                          <Badge variant={lead.score >= 80 ? "default" : "secondary"}>{lead.score}%</Badge>
                        </TableCell>
                        <TableCell>{lead.location}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.price} monet</TableCell>
                        <TableCell>
                          <Badge variant={lead.status === "available" ? "default" : "secondary"}>
                            {lead.status === "available" ? "Dostępny" : "Sprzedany"}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.date}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(lead)}
                            disabled={lead.status === "sold"}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="h-24 text-center">
                        Nie znaleziono leadów.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Potwierdź usunięcie</DialogTitle>
              <DialogDescription>Czy na pewno chcesz usunąć ten lead? Tej operacji nie można cofnąć.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedLead && (
                <div className="rounded-md bg-muted p-4">
                  <p>
                    <strong>Typ:</strong> {selectedLead.type}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedLead.email}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Anuluj
              </Button>
              <Button variant="destructive" onClick={handleDeleteLead} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Usuwanie...
                  </>
                ) : (
                  "Usuń lead"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}

