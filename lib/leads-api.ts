import { supabase } from "./supabase"
import type { Lead } from "@/types/lead"

// Fetch all available leads
export async function fetchAvailableLeads(): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!data) return []

    return data.map((lead) => ({
      ...lead,
      date: new Date(lead.created_at).toISOString().split("T")[0],
    }))
  } catch (error) {
    console.error("Error fetching leads:", error)
    return []
  }
}

// Define a type for the purchase data structure
interface PurchaseWithLead {
  id: string
  order_number: string
  price: number
  created_at: string
  lead_id: string
  lead: Lead
}

// Fetch purchased leads for a user
export async function fetchPurchasedLeads(userId: string): Promise<Lead[]> {
  try {
    const { data, error } = await supabase
      .from("purchases")
      .select(`
        id,
        order_number,
        price,
        created_at,
        lead_id,
        lead:leads(*)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) return []

    const result: Lead[] = []

    for (const purchase of data) {
        if (purchase.lead) {
          // Handle the case where lead is an array
          const leadData = Array.isArray(purchase.lead) ? purchase.lead[0] : purchase.lead;
          
          result.push({
            ...leadData,
            order_number: purchase.order_number,
            date: new Date(purchase.created_at).toISOString().split("T")[0],
          })
        }
      }

    return result
  } catch (error) {
    console.error("Error fetching purchased leads:", error)
    return []
  }
}

// Add a new lead (admin only)
export async function addLead(leadData: Omit<Lead, "id" | "status" | "date">): Promise<Lead | null> {
  try {
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          type: leadData.type,
          interest: leadData.interest,
          location: leadData.location,
          email: leadData.email,
          phone: leadData.phone,
          score: leadData.score,
          price: leadData.price,
          status: "available",
        },
      ])
      .select()
      .single()

    if (error) throw error

    if (!data) return null

    return {
      ...data,
      date: new Date(data.created_at).toISOString().split("T")[0],
    }
  } catch (error) {
    console.error("Error adding lead:", error)
    return null
  }
}

// Delete a lead (admin only)
export async function deleteLead(leadId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("leads").delete().eq("id", leadId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting lead:", error)
    return false
  }
}

// Purchase a lead
export async function purchaseLead(
  leadId: string,
  userId: string,
  price: number,
): Promise<{ success: boolean; order_number?: string }> {
  try {
    // First check if the lead is still available
    const { data: lead, error: checkError } = await supabase.from("leads").select("status").eq("id", leadId).single()

    if (checkError) throw checkError
    if (!lead || lead.status !== "available") {
      return { success: false }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Start transaction
    // 1. Update lead status
    const { error: updateLeadError } = await supabase.from("leads").update({ status: "sold" }).eq("id", leadId)

    if (updateLeadError) throw updateLeadError

    // 2. Deduct coins from user
    const { data: userData, error: getUserError } = await supabase
      .from("profiles")
      .select("coins")
      .eq("id", userId)
      .single()

    if (getUserError) throw getUserError

    const newCoins = Math.max(0, userData.coins - price)

    const { error: updateUserError } = await supabase.from("profiles").update({ coins: newCoins }).eq("id", userId)

    if (updateUserError) throw updateUserError

    // 3. Create purchase record
    const { error: purchaseError } = await supabase.from("purchases").insert([
      {
        lead_id: leadId,
        user_id: userId,
        price: price,
        order_number: orderNumber,
      },
    ])

    if (purchaseError) throw purchaseError

    return { success: true, order_number: orderNumber }
  } catch (error) {
    console.error("Error purchasing lead:", error)
    return { success: false }
  }
}

