import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { ComplaintStatus } from "@prisma/client";
import { Session, DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"]
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "week";

    // Calculate date range based on timeRange
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case "day":
        startDate.setDate(now.getDate() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate.setDate(now.getDate() - 30);
        break;
      case "year":
        startDate.setDate(now.getDate() - 365);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get total complaints
    const totalComplaints = await prisma.complaint.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // Get complaints by status
    const complaintsByStatus = await prisma.complaint.groupBy({
      by: ["status"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get complaints by priority
    const complaintsByPriority = await prisma.complaint.groupBy({
      by: ["priority"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get complaints by agency
    const complaintsByAgency = await prisma.complaint.groupBy({
      by: ["agencyId"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get agency names
    const agencies = await prisma.agency.findMany({
      where: {
        id: {
          in: complaintsByAgency.map((c) => c.agencyId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Get complaints by category
    const complaintsByCategory = await prisma.complaint.groupBy({
      by: ["categoryId"],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: true,
    });

    // Get category names
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: complaintsByCategory.map((c) => c.categoryId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Calculate average response time
    const responses = await prisma.response.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        complaint: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    const averageResponseTime = responses.length
      ? responses.reduce((acc, response) => {
          const responseTime =
            response.createdAt.getTime() -
            response.complaint.createdAt.getTime();
          return acc + responseTime;
        }, 0) / responses.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Format the response
    const stats = {
      totalComplaints,
      complaintsByStatus: Object.fromEntries(
        complaintsByStatus.map((c) => [c.status, c._count])
      ),
      complaintsByPriority: Object.fromEntries(
        complaintsByPriority.map((c) => [c.priority, c._count])
      ),
      complaintsByAgency: complaintsByAgency.map((c) => ({
        agencyName: agencies.find((a) => a.id === c.agencyId)?.name || "Unknown",
        count: c._count,
      })),
      complaintsByCategory: complaintsByCategory.map((c) => ({
        categoryName:
          categories.find((cat) => cat.id === c.categoryId)?.name || "Unknown",
        count: c._count,
      })),
      averageResponseTime,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}