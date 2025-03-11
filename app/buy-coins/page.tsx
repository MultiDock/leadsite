"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function BuyCoinsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const plans = [
    {
      id: "basic",
      name: "Podstawowy",
      coins: 500,
      price: "99 zł",
      features: ["Dostęp do podstawowych leadów", "Ważność 30 dni"],
    },
    {
      id: "standard",
      name: "Standard",
      coins: 1500,
      price: "249 zł",
      features: ["Dostęp do wszystkich leadów", "Priorytetowe powiadomienia", "Ważność 30 dni"],
    },
    {
      id: "premium",
      name: "Premium",
      coins: 5000,
      price: "699 zł",
      features: ["Dostęp do wszystkich leadów", "Priorytetowe powiadomienia", "Eksport danych", "Ważność 60 dni"],
    },
  ]

  const handlePurchase = async () => {
    if (!selectedPlan) return

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      // In a real app, redirect to payment gateway
      router.push("/payment-success")
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="container max-w-6xl py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Powrót do pulpitu
      </Button>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Kup monety</h1>
        <p className="mt-2 text-muted-foreground">Wybierz pakiet, który najlepiej odpowiada Twoim potrzebom</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${selectedPlan === plan.id ? "border-primary ring-2 ring-primary ring-opacity-50" : ""}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.coins} monet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{plan.price}</div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={selectedPlan === plan.id ? "default" : "outline"}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {selectedPlan === plan.id ? "Wybrano" : "Wybierz"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button size="lg" disabled={!selectedPlan || loading} onClick={handlePurchase}>
          {loading ? "Przetwarzanie..." : "Przejdź do płatności"}
        </Button>
      </div>
    </div>
  )
}

