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
import { ThemeToggle } from "@/components/theme-toggle"

const formSchema = z.object({
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

export default function RegisterPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
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
        toast.error(result.error || 'Registration failed', {
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
      
      // Optional: redirect to login or dashboard
      // router.push('/login')
      
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Something went wrong', {
        description: 'Please try again later.',
        position: "bottom-right",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>
            Register your profile below.
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
                  <Input
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
                  <Input
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
                  
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            form="form-rhf-input"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </Field>
      </CardFooter>
    </Card>
    </div>
  )
}
