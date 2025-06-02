"use client"

import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toast } = useToast()

  return (
    <div id="toast-container">
      {/* For now, we're using alerts for toast notifications */}
      {/* You can implement a proper toast UI here later */}
    </div>
  )
} 