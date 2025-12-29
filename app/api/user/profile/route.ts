// app/api/user/profile/route.ts
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from "@/lib/auth"

// {
//  "username": "new_username",
//  "name": "New Name",
//  "email": "new@example.com",
//  "phone": "+1234567890"
// }

export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        username: true,
        name: true,
        email: true,
        phone: true,
      },
    })
    return Response.json(user)
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}


export async function PUT(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const body = await req.json()

    const updated = await prisma.users.update({
      where: { id: userId },
      data: {
        username: body.username,
        name: body.name,
        email: body.email,
        phone: body.phone,
      },
    })

    return Response.json(updated)
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}
