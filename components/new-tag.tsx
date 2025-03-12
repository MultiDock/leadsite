"use client"

import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"

export interface NewTagProps {
  className?: string
}

export function NewTag({ className }: NewTagProps) {
  const [bounce, setBounce] = useState(false)

  // Create a bouncing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBounce((prev) => !prev)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Badge className={`bg-red-500 text-white transition-transform ${bounce ? "translate-y-[-2px]" : ""} ${className}`}>
      Nowy
    </Badge>
  )
}

