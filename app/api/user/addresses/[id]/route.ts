import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET - Address detail GET
async function resolveParams(params: any) {
  return params && typeof params.then === 'function' ? await params : params;
}

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveParams(params);
    const id = parseInt(resolved?.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const whereClause: any = { id };
    
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
  { params }: { params: any }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, street, city, zip, country } = body;

    const resolved = await resolveParams(params);
    const id = parseInt(resolved?.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const whereClause: any = { id };
    
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
      where: { id },
      data: {
        ...(id && { id } ),
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
  { params }: { params: any }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolved = await resolveParams(params);
    const id = parseInt(resolved?.id);
    if (Number.isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const whereClause: any = { id };
    
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
      where: { id },
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
