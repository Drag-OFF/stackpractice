"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

export function LogoutIcon() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to sign out')
      toast.success('Signed out', { position: 'bottom-right' })
      router.push('/login')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      toast.error(message, { position: 'bottom-right' })
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label="Sign out"
      title="Sign out"
    >
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  )
}