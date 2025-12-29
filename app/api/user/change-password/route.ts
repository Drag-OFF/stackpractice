// app/api/user/change-password/route.ts
import { getUserFromRequest } from "@/lib/auth"
import { hashPassword, verifyPassword } from "@/lib/hash"
import { prisma } from '@/lib/prisma'

// {
//  "oldPassword": "current_password",
//  "newPassword": "new_secure_password"
// }

export async function PUT(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const { oldPassword, newPassword } = await req.json()

    if (!oldPassword || !newPassword) {
      return new Response("Missing fields", { status: 400 })
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    const isValid = await verifyPassword(oldPassword, user.password)
    if (!isValid) {
      return new Response("Invalid current password", { status: 403 })
    }

    const hashed = await hashPassword(newPassword)

    await prisma.users.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return new Response("Password successfully updated", { status: 200 })
  } catch (err) {
    console.error("Error:", err)
    return new Response("Unauthorized", { status: 401 })
  }
}
