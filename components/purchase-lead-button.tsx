"use client"

import { useState } from "react"
import { DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { purchaseLead } from "@/lib/api"
import { toast } from "sonner"
import { useAuth } from "@/contexts/auth-context"

interface PurchaseLeadButtonProps {
  leadId: string
  price: number
  onSuccess?: () => void
}

export function PurchaseLeadButton({ leadId, price, onSuccess }: PurchaseLeadButtonProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Nie jesteś zalogowany", {
        description: "Zaloguj się, aby kupić lead",
      })
      return
    }

    if (user.coins < price) {
      toast.error("Niewystarczająca liczba monet", {
        description: "Doładuj swoje konto, aby kupić ten lead",
      })
      return
    }

    setLoading(true)
    try {
      // In a real app, call your API
      const result = await purchaseLead(leadId)

      if (result.success) {
        toast.success("Lead zakupiony pomyślnie", {
          description: "Możesz teraz zobaczyć szczegóły w zakładce Zakupione Leady",
        })

        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      toast.error("Błąd zakupu", {
        description: "Nie udało się zakupić leada. Spróbuj ponownie.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button size="sm" onClick={handlePurchase} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          Kupowanie...
        </>
      ) : (
        <>
          <DollarSign className="mr-1 h-3 w-3" />
          {price} monet
        </>
      )}
    </Button>
  )
}

