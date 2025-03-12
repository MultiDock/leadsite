"use client"

import { Badge } from "@/components/ui/badge"
import { motion, useCycle } from "framer-motion"
import { useEffect } from "react"

export interface NewTagProps {
  className?: string
}

export function NewTag({ className }: NewTagProps) {
  const [bounce, cycleBounce] = useCycle(0, -4)

  // Animate the bounce smoothly every 1.5s
  useEffect(() => {
    const interval = setInterval(() => {
      cycleBounce()
    }, 1500)

    return () => clearInterval(interval)
  }, [cycleBounce])

  return (
    <motion.div
      animate={{ y: bounce }}
      transition={{ type: "spring", stiffness: 150, damping: 10 }}
    >
      <Badge
        className={`bg-red-200 text-red-800 font-medium rounded-md px-2 py-1 text-xs ${className}`}
      >
        Nowy
      </Badge>
    </motion.div>
  )
}
