import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import { z } from "zod";
import { ComplaintStatus, Priority } from "@prisma/client";

type SessionUser = {
  id: string;
  role?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  agencyId: z.string().min(1, "Please select an agency"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view complaints" },
        { status: 401 }
      );
    }

    // Get all complaints for the logged-in user
    const complaints = await prisma.complaint.findMany({
      where: {
        userId: session.user.id,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    return NextResponse.json(
      { error: "Error fetching complaints" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in complaint POST:', session);

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a complaint" },
        { status: 401 }
      );
    }

    // Get the user from the database to ensure we have the correct ID
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email!,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    console.log('Complaint request body:', body);

    try {
      const validatedData = complaintSchema.parse(body);
      console.log('Validated complaint data:', validatedData);

      // Verify that the agency exists
      const agency = await prisma.agency.findUnique({
        where: {
          id: validatedData.agencyId,
        },
      });

      if (!agency) {
        return NextResponse.json(
          { error: "Selected agency does not exist" },
          { status: 400 }
        );
      }

      // Create the complaint
      const complaint = await prisma.complaint.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          categoryId: validatedData.categoryId,
          agencyId: validatedData.agencyId,
          location: validatedData.location,
          priority: validatedData.priority,
          status: ComplaintStatus.SUBMITTED,
          userId: user.id,
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
        },
      });

      console.log('Created complaint:', complaint);
      return NextResponse.json(complaint, { status: 201 });
    } catch (validationError) {
      console.error('Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid request data", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json(
      { error: "Error creating complaint" },
      { status: 500 }
    );
  }
}