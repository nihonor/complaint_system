import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth/authOptions";
import prisma from "@/prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id: params.id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        agency: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!complaint) {
      return new NextResponse("Complaint not found", { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Error fetching complaint:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 