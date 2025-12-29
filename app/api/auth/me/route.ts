// app/api/auth/me/route.ts
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies() 
  const token = cookieStore.get('session')?.value


  // No Token Found
  if (!token) {
    return NextResponse.json({ error: 'No created session!' }, { status: 401 })
  }

  // Decrypt Token
  try {
    const session = await decrypt(token)
    return NextResponse.json({ session })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid or expired token!' }, { status: 401 })
  }
}
