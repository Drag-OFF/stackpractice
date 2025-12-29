// app/api/user/billing-address/route.ts
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from "@/lib/auth"

// {
//   shipping_address: "123 Main St, Springfield, USA"  
// }

export async function GET(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { billing_address: true },
    })
    return Response.json({ billing_address: user?.billing_address ?? "" })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserFromRequest(req)
    const { billing_address } = await req.json()

    if (!billing_address) {
      return new Response("Missing address", { status: 400 })
    }

    await prisma.users.update({
      where: { id: userId },
      data: { billing_address },
    })

    return new Response("Address updated", { status: 200 })
  } catch {
    return new Response("Unauthorized", { status: 401 })
  }
}
