// PurchaseLeadButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Lead } from "@/types/lead";
import { useRouter } from "next/navigation";

interface PurchaseLeadButtonProps {
  lead: Lead;
}

export function PurchaseLeadButton({ lead }: PurchaseLeadButtonProps) {
  const { purchaseLead, loading } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setIsPurchasing(true);
    try {
      const success = await purchaseLead(lead);
      if (success) {
        // Force a refresh of the page to update the UI
        router.refresh();
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Button 
      onClick={handlePurchase} 
      disabled={isPurchasing || loading}

    >
      {isPurchasing ? "Kupowanie..." : `Kup za ${lead.price} monet`}
    </Button>
  );
}