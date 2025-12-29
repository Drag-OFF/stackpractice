import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/hash'
import { z } from 'zod'

// {
//  "username": "new_user",
//  "email": "new@example.com",
//  "password": "securepassword",
//  "phone": "+1234567890"
// }

const registerSchema = z.object({
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
    .min(1, "Phone number is required.")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"],
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const validatedData = registerSchema.parse(body)
    
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })
    
    if (existingUser) {
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
      if (existingUser.username === validatedData.username) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        )
      }
    }
    
    //const hashedPassword = await bcrypt.hash(validatedData.password, 10) // created hashing function separately
    const hashedPassword = await hashPassword(validatedData.password)
    
    const user = await prisma.users.create({
      data: {
        username: validatedData.username,
        name: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone,
        role: 'user',
        is_active: true,
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        created: true,
      }
    })
    
    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user 
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.issues 
        },
        { status: 400 }
      )
    }
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
