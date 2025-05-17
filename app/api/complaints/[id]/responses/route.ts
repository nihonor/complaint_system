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
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;

    // Check if user is an agency official
    if (user.role !== "AGENCY_OFFICIAL") {
      return NextResponse.json(
        { error: "Only agency officials can respond to complaints" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = responseSchema.parse(body);

    // Check if the complaint exists and belongs to the user's agency
    const complaint = await prisma.complaint.findUnique({
      where: { id: params.id },
      include: { agency: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Complaint not found" },
        { status: 404 }
      );
    }

    // Create the response and update the complaint status
    const [response] = await prisma.$transaction([
      prisma.response.create({
        data: {
          content: validatedData.content,
          complaintId: params.id,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      }),
      prisma.complaint.update({
        where: { id: params.id },
        data: { status: validatedData.status },
      }),
    ]);

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

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