import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { ComplaintStatus } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "AGENCY_OFFICIAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();

    if (!Object.values(ComplaintStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Find the agency by the user's name
    const agency = await prisma.agency.findFirst({
      where: {
        name: session.user.name || "",
      },
    });

    if (!agency) {
      return NextResponse.json({ error: "Agency not found" }, { status: 404 });
    }

    // Update the complaint status
    const complaint = await prisma.complaint.update({
      where: {
        id: params.id,
        agencyId: agency.id, // Ensure the complaint belongs to this agency
      },
      data: {
        status,
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error updating complaint status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 