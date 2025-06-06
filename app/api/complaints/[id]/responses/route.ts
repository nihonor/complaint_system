import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { z } from "zod";

type SessionUser = {
  id: string;
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const responseSchema = z.object({
    
  content: z.string().min(10, "Response must be at least 10 characters"),
  status: z.enum([
    "UNDER_REVIEW",
    "IN_PROGRESS",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
  ]),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "AGENCY_OFFICIAL") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await request.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Response content is required" },
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

    // Verify the complaint exists and belongs to this agency
    const complaint = await prisma.complaint.findUnique({
      where: {
        id: params.id,
        agencyId: agency.id,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Create the response
    const response = await prisma.response.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        complaintId: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;

    // Check if the complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id },
      include: {
        responses: {
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // If user is not admin or agency official, only show their own complaint's responses
    if (
      user.role !== "ADMIN" &&
      user.role !== "AGENCY_OFFICIAL" &&
      complaint.userId !== user.id
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json(complaint.responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}