import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total complaints
    const totalComplaints = await prisma.complaint.count();

    // Get pending complaints
    const pendingComplaints = await prisma.complaint.count({
      where: {
        status: "IN_PROGRESS",
      },
    });

    // Get resolved complaints
    const resolvedComplaints = await prisma.complaint.count({
      where: {
        status: "RESOLVED",
      },
    });

    // Get total agencies
    const totalAgencies = await prisma.agency.count();

    // Get total categories
    const totalCategories = await prisma.category.count();

    // Get total users
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      totalAgencies,
      totalCategories,
      totalUsers,
    });
  } catch (error) {
    console.error("[ADMIN_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}