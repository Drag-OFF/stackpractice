"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { PasswordInput } from "@/components/ui/password-input"

export const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(10, "Username must be at most 10 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores."
    ),
  email: z
    .string()
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(20, "Password must be at most 20 characters."),
  confirmPassword: z
    .string()
    .min(6, "Confirm Password must be at least 6 characters.")
    .max(20, "Confirm Password must be at most 20 characters."),
  phone: z
  .string()
  .min(1, "Phone number must be at least 1 characters.")
  .refine(isValidPhoneNumber, {
    message: "Invalid phone number"
  })
})

export type RegisterFormData = z.infer<typeof registerFormSchema>

interface RegisterFormProps {
  onSuccess?: (data: { user: any }) => void
  onError?: (error: string) => void
  title?: string
  description?: string
  loginUrl?: string
  showResetButton?: boolean
  submitButtonText?: string
  className?: string
}

export function RegisterForm({
  onSuccess,
  onError,
  title = "Register",
  description = "Register your profile below.",
  loginUrl = "/login",
  showResetButton = true,
  submitButtonText = "Register",
  className,
}: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  })

  async function onSubmit(data: RegisterFormData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        const errorMessage = result.error || 'Registration failed'
        onError?.(errorMessage)
        toast.error(errorMessage, {
          description: result.details 
            ? JSON.stringify(result.details, null, 2)
            : undefined,
          position: "bottom-right",
        })
        return
      }
      
      toast.success('Registration successful!', {
        description: `Welcome, ${result.user.username}!`,
        position: "bottom-right",
      })
      
      form.reset()
      onSuccess?.({ user: result.user })
      
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = 'Something went wrong'
      onError?.(errorMessage)
      toast.error(errorMessage, {
        description: 'Please try again later.',
        position: "bottom-right",
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-input" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="username"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-input-username">
                    Username
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-username"
                    placeholder="Username"
                    autoComplete="username"
                  />
                  <FieldDescription>
                    This is your public display name.
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  
                </Field>
              )}
            />
            <Controller
            name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-input-email">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-input-email"
                    placeholder="example@example.com"
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
                  <FieldLabel htmlFor="form-rhf-input-password">
                    Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-rhf-input-password"
                    placeholder="Password"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  
                </Field>
              )}
            />
            <Controller
            name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-input-confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <PasswordInput
                    {...field}
                    id="form-rhf-input-confirm-password"
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  
                </Field>
              )}
            />
            <Controller
            name="phone"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-input-phone">
                    Phone
                  </FieldLabel>
                  <PhoneInput
                    international
                    defaultCountry="HU"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter phone number"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  <FieldDescription>
                    Already have an account? <a href={loginUrl}>Log in</a>
                  </FieldDescription>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          {showResetButton && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={form.formState.isSubmitting}
            >
              Reset
            </Button>
          )}
          <Button 
            type="submit" 
            form="form-rhf-input"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Submitting...' : submitButtonText}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
