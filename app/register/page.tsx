"use client"

import { useRouter } from "next/navigation"
import { RegisterForm } from "@/components/ui/register-form"
import { ThemeToggle } from "@/components/theme-toggle"

export default function RegisterPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <RegisterForm 
        className="w-full sm:max-w-md"
        onSuccess={(data) => {
          router.push('/login')
        }}
      />
    </div>
  )
}
