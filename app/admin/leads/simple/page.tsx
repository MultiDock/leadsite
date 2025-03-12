"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function SimpleAdminPage() {
  const [formData, setFormData] = useState({
    type: "E-commerce",
    interest: "Kosmetyki",
    location: "Warszawa",
    email: "test@example.com",
    phone: "123-456-789",
    score: 85,
    price: 10,
  })
  const [loading, setLoading] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const [loadingLeads, setLoadingLeads] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "score" || name === "price" ? Number.parseInt(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Direct Supabase insert
      const { data, error } = await supabase
        .from("leads")
        .insert([
          {
            type: formData.type,
            interest: formData.interest,
            location: formData.location,
            email: formData.email,
            phone: formData.phone,
            score: formData.score,
            price: formData.price,
            status: "available",
          },
        ])
        .select()

      if (error) throw error

      toast.success("Lead added successfully")
      console.log("Added lead:", data)

      // Refresh leads list
      fetchLeads()
    } catch (error) {
      console.error("Error adding lead:", error)
      toast.error("Failed to add lead")
    } finally {
      setLoading(false)
    }
  }

  const fetchLeads = async () => {
    setLoadingLeads(true)
    try {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

      if (error) throw error

      setLeads(data || [])
    } catch (error) {
      console.error("Error fetching leads:", error)
      toast.error("Failed to fetch leads")
    } finally {
      setLoadingLeads(false)
    }
  }

  // Load leads on initial render
  useState(() => {
    fetchLeads()
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Simple Admin Interface</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Add New Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input id="type" name="type" value={formData.type} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest">Interest</Label>
                <Input id="interest" name="interest" value={formData.interest} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="score">Score (1-100)</Label>
                  <Input
                    id="score"
                    name="score"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.score}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" name="price" type="number" min="1" value={formData.price} onChange={handleChange} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Adding..." : "Add Lead"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLeads ? (
              <div className="text-center py-4">Loading...</div>
            ) : leads.length > 0 ? (
              <div className="space-y-4">
                {leads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="border p-4 rounded-md">
                    <div className="font-bold">{lead.type}</div>
                    <div className="text-sm text-gray-500">{lead.interest}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>Email: {lead.email}</div>
                      <div>Phone: {lead.phone}</div>
                      <div>Score: {lead.score}</div>
                      <div>Price: {lead.price}</div>
                      <div>Status: {lead.status}</div>
                      <div>Created: {new Date(lead.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">No leads found</div>
            )}

            <Button variant="outline" className="w-full mt-4" onClick={fetchLeads} disabled={loadingLeads}>
              Refresh Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

