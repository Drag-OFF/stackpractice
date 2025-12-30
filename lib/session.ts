// lib/session.ts
import { EncryptJWT, jwtDecrypt } from 'jose'
import { createSecretKey } from 'crypto'
import { cookies } from 'next/headers'

const secret = createSecretKey(Buffer.from(process.env.ENCRYPTION_SECRET!, 'base64'))
const alg = 'dir'

export interface SessionPayload {
  userId: number
  username: string
  role: string
  [key: string]: any
}

// JWT Encryption
export function encrypt(payload: SessionPayload): Promise<string> {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg, enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(secret)
}

// JWT Decryption
export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, secret)
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

// Get session from cookie
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('session')?.value
  
  if (!sessionToken) {
    return null
  }
  
  return await decrypt(sessionToken)
}
