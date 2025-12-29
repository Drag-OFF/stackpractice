// lib/session.ts
import { EncryptJWT, jwtDecrypt } from 'jose'
import { createSecretKey } from 'crypto'

const secret = createSecretKey(Buffer.from(process.env.ENCRYPTION_SECRET!, 'base64'))
const alg = 'dir'

// JWT Encryption
export async function encrypt(payload: any): Promise<string> {
  return await new EncryptJWT(payload)
    .setProtectedHeader({ alg, enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .encrypt(secret)
}

// JWT Decryption
export async function decrypt(token: string): Promise<any> {
  const { payload } = await jwtDecrypt(token, secret)
  return payload
}
