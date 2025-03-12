// This file represents the Supabase Edge Function for purchasing leads
// In a real implementation, you would deploy this to Supabase Edge Functions

import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { leadId, userId, price } = await req.json()

    // Validate input
    if (!leadId || !userId || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // First check if the lead is still available
    const { data: lead, error: checkError } = await supabase.from("leads").select("status").eq("id", leadId).single()

    if (checkError) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    if (lead.status !== "available") {
      return NextResponse.json({ error: "Lead is no longer available" }, { status: 400 })
    }

    // Check if user has enough coins
    const { data: user, error: userError } = await supabase.from("profiles").select("coins").eq("id", userId).single()

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.coins < price) {
      return NextResponse.json({ error: "Insufficient coins" }, { status: 400 })
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`

    // Start transaction
    // 1. Update lead status
    const { error: updateLeadError } = await supabase.from("leads").update({ status: "sold" }).eq("id", leadId)

    if (updateLeadError) {
      return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 })
    }

    // 2. Deduct coins from user
    const { error: updateUserError } = await supabase
      .from("profiles")
      .update({ coins: user.coins - price })
      .eq("id", userId)

    if (updateUserError) {
      // Rollback lead status change if user update fails
      await supabase.from("leads").update({ status: "available" }).eq("id", leadId)

      return NextResponse.json({ error: "Failed to update user coins" }, { status: 500 })
    }

    // 3. Create purchase record
    const { error: purchaseError } = await supabase.from("purchases").insert([
      {
        lead_id: leadId,
        user_id: userId,
        price: price,
        order_number: orderNumber,
      },
    ])

    if (purchaseError) {
      // Rollback previous changes if purchase creation fails
      await supabase.from("leads").update({ status: "available" }).eq("id", leadId)

      await supabase.from("profiles").update({ coins: user.coins }).eq("id", userId)

      return NextResponse.json({ error: "Failed to create purchase record" }, { status: 500 })
    }

    return NextResponse.json({ success: true, order_number: orderNumber })
  } catch (error) {
    console.error("Error purchasing lead:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

