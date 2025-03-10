"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Change the interface definition to export it
export interface NewTagProps {
  date: string
}

export function NewTag({ date }: NewTagProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isNew, setIsNew] = useState(false)

  useEffect(() => {
    // Check if the lead is less than 24 hours old
    const leadDate = new Date(date)
    const now = new Date()
    const diffHours = (now.getTime() - leadDate.getTime()) / (1000 * 60 * 60)

    if (diffHours <= 24) {
      setIsNew(true)
    } else {
      setIsNew(false)
    }
  }, [date])

  if (!isNew || !isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        "absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full",
        "animate-bounce shadow-md",
      )}
    >
      NOWY
    </div>
  )
}

