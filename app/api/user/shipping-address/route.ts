// app/api/user/shipping-address/route.ts
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { shipping_address: true },
    })
    return Response.json({ shipping_address: user?.shipping_address ?? "" })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const { shipping_address } = await req.json()

    if (!shipping_address) {
      return new Response("Missing address", { status: 400 })
    }

    await prisma.users.update({
      where: { id: userId },
      data: { shipping_address },
    })

    return new Response("Updated address", { status: 200 })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}
