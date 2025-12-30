import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - Address detail GET
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = { id: parseInt(params.id) };
    
    // Regular user can only view their own addresses
    if (session.role !== "admin") {
      whereClause.user_id = session.userId;
    }

    const address = await prisma.addresses.findFirst({
      where: whereClause,
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 }
    );
  }
}

// PUT - Adress modify
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, street, city, zip, country } = body;

    const whereClause: any = { id: parseInt(params.id) };
    
    // Regular user can only modify their own addresses
    if (session.role !== "admin") {
      whereClause.user_id = session.userId;
    }

    const existingAddress = await prisma.addresses.findFirst({
      where: whereClause,
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const updatedAddress = await prisma.addresses.update({
      where: { id: parseInt(params.id) },
      data: {
        ...(type && { type }),
        ...(street && { street }),
        ...(city && { city }),
        ...(zip && { zip }),
        ...(country && { country }),
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "Failed to update address" },
      { status: 500 }
    );
  }
}

// DELETE - Adress delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const whereClause: any = { id: parseInt(params.id) };
    
    // Regular user can only delete their own addresses
    if (session.role !== "admin") {
      whereClause.user_id = session.userId;
    }

    const existingAddress = await prisma.addresses.findFirst({
      where: whereClause,
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.addresses.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "Failed to delete address" },
      { status: 500 }
    );
  }
}
