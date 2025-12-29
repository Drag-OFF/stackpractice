"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters."),
})

export type LoginFormData = z.infer<typeof loginFormSchema>

interface LoginFormProps {
  onSuccess?: (data: { user: any }) => void
  onError?: (error: string) => void
  title?: string
  description?: string
  registerUrl?: string
  submitButtonText?: string
  className?: string
  showForgotPassword?: boolean
}

export function LoginForm({
  onSuccess,
  onError,
  title = "Login to your account",
  description = "Enter your email below to login to your account",
  registerUrl = "/register",
  submitButtonText = "Login",
  showForgotPassword = false,
  className,
  ...props
}: LoginFormProps & React.ComponentProps<"div">) {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        const errorMessage = result.error || 'Login failed'
        onError?.(errorMessage)
        toast.error(errorMessage, {
          description: result.details 
            ? JSON.stringify(result.details, null, 2)
            : undefined,
          position: "bottom-right",
        })
        return
      }
      
      toast.success('Login successful!', {
        description: `Welcome back, ${result.user.username || result.user.email}!`,
        position: "bottom-right",
      })
      
      onSuccess?.({ user: result.user })
      
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = 'Something went wrong'
      onError?.(errorMessage)
      toast.error(errorMessage, {
        description: 'Please try again later.',
        position: "bottom-right",
      })
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="form-login" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      placeholder="m@example.com"
                      autoComplete="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <div className="flex items-center justify-between">
                      <FieldLabel htmlFor="login-password">Password</FieldLabel>
                      {showForgotPassword && (
                        <a href="/forgot-password" className="text-sm underline">
                          Forgot password?
                        </a>
                      )}
                    </div>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button 
                  type="submit" 
                  form="form-login"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? 'Logging in...' : submitButtonText}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href={registerUrl}>Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
