// lib/auth.ts

import { decrypt } from "@/lib/session"

export async function getUserFromRequest(req: Request) {
  const cookie = req.headers.get("cookie")
  if (!cookie) throw new Error("Unauthorized")

  const sessionToken = cookie
    .split(";")
    .find((c) => c.trim().startsWith("session="))
    ?.split("=")[1]

  if (!sessionToken) throw new Error("Unauthorized")

  const session = await decrypt(sessionToken)
  if (!session?.userId) throw new Error("Unauthorized")

  return session.userId
}