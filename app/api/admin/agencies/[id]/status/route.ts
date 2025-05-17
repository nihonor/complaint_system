import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const agency = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!agency) {
      return NextResponse.json(
        { error: "Agency not found" },
        { status: 404 }
      );
    }

    if (agency.role !== "agency") {
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 400 }
      );
    }

    const updatedAgency = await prisma.user.update({
      where: { id: params.id },
      data: { status },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        type: "agency",
        description: `Agency ${agency.name} status updated to ${status}`,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      id: updatedAgency.id,
      name: updatedAgency.name,
      email: updatedAgency.email,
      status: updatedAgency.status,
      createdAt: updatedAgency.createdAt,
    });
  } catch (error) {
    console.error("Error updating agency status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 