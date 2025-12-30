import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - Addresses list GET
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get("userId");

    // Admin can fetch any user's addresses, regular user only their own
    let targetUserId = session.userId;
    if (userIdParam) {
      if (session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetUserId = parseInt(userIdParam);
    }

    const addresses = await prisma.addresses.findMany({
      where: { user_id: targetUserId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST - new adress create
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, type, street, city, zip, country } = body;

    // Admin can create address for any user
    let targetUserId = session.userId;
    if (userId) {
      if (session.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      targetUserId = userId;
    }

    if (!type || !street || !city || !zip || !country) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (type !== "SHIPPING" && type !== "BILLING") {
      return NextResponse.json(
        { error: "Type must be SHIPPING or BILLING" },
        { status: 400 }
      );
    }

    const address = await prisma.addresses.create({
      data: {
        user_id: targetUserId,
        type,
        street,
        city,
        zip,
        country,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
