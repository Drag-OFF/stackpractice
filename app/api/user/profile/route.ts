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

    // Basic validation - strict ASCII email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!body.email || !emailRegex.test(body.email)) {
      return new Response("Invalid email format", { status: 400 })
    }

    if (!body.username || body.username.length < 3) {
      return new Response("Invalid username", { status: 400 })
    }

    // Uniqueness checks
    const existingUsername = await prisma.users.findFirst({ where: { username: body.username, NOT: { id: userId } } })
    if (existingUsername) {
      return new Response("Username already in use", { status: 409 })
    }

    const existingEmail = await prisma.users.findFirst({ where: { email: body.email, NOT: { id: userId } } })
    if (existingEmail) {
      return new Response("Email already in use", { status: 409 })
    }

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
  } catch (err) {
    console.error('Error updating profile:', err)
    return new Response("Unauthorized", { status: 401 })
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserFromRequest(req)

    // Delete all user's addresses first (foreign key constraint)
    await prisma.addresses.deleteMany({
      where: { user_id: userId },
    })

    // Delete the user
    await prisma.users.delete({
      where: { id: userId },
    })

    // Clear the session cookie
    const response = new Response("User deleted successfully", { status: 200 })
    response.headers.set('Set-Cookie', 'session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0')

    return response
  } catch (err) {
    console.error("Error deleting user:", err)
    return new Response("Unauthorized or deletion failed", { status: 401 })
  }
}
