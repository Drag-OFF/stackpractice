import { NextResponse } from 'next/server'
import { encrypt } from '@/lib/session'
import { verifyPassword } from '@/lib/hash'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// { 
//   "email": "user@example.com",
//   "password": "securepassword"
// }

export async function POST(req: Request) {
  interface LoginBody { 
    email: string; 
    password: string 
  }

  // Parse Request Body
  const { email, password }: LoginBody = await req.json()

  // Find User
  const user = await prisma.users.findFirst({ where: { email } })
  if (!user) return NextResponse.json({ error: 'User does not exist!' }, { status: 401 })

  // Verify 
  const valid = await verifyPassword(password, user.password)
  if (!valid) return NextResponse.json({ error: 'Invalid password!' }, { status: 401 })

  // JWT Creation
  const token = await encrypt({
    userId: user.id,
    email: user.email,
    username: user.username,
    phone: user.phone,
    createdAt: user.created,
    role: user.role,
  })

  // Set Cookie
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  // Successful Response
  return NextResponse.json({ message: 'Successful login!' })
}
