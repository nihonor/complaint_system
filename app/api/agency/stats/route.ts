import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { ComplaintStatus } from "@prisma/client";

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

    // Get complaint counts by status
    const [pendingComplaints, inProgressComplaints, resolvedComplaints] = await Promise.all([
      prisma.complaint.count({
        where: {
          agencyId: agency.id,
          status: ComplaintStatus.SUBMITTED,
        },
      }),
      prisma.complaint.count({
        where: {
          agencyId: agency.id,
          status: ComplaintStatus.IN_PROGRESS,
        },
      }),
      prisma.complaint.count({
        where: {
          agencyId: agency.id,
          status: ComplaintStatus.RESOLVED,
        },
      }),
    ]);

    return NextResponse.json({
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
    });
  } catch (error) {
    console.error("Error fetching agency stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 