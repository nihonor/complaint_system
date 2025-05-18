import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { ComplaintStatus } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view stats" },
        { status: 401 }
      );
    }

    // Get user's complaints grouped by status
    const complaints = await prisma.complaint.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        status: true,
      },
    });

    // Calculate stats
    const stats = {
      submittedComplaints: complaints.filter(c => c.status === ComplaintStatus.SUBMITTED).length,
      inProgressComplaints: complaints.filter(c => 
        c.status === ComplaintStatus.UNDER_REVIEW || 
        c.status === ComplaintStatus.IN_PROGRESS
      ).length,
      resolvedComplaints: complaints.filter(c => 
        c.status === ComplaintStatus.RESOLVED || 
        c.status === ComplaintStatus.CLOSED
      ).length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Error fetching user stats" },
      { status: 500 }
    );
  }
} 