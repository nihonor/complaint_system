import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "AGENCY_OFFICIAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get recent complaints
    const recentComplaints = await prisma.complaint.findMany({
      where: {
        agencyId: agency.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        category: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(recentComplaints);
  } catch (error) {
    console.error("Error fetching recent complaints:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 