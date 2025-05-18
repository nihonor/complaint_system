import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in agencies GET:', session);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agencies = await prisma.user.findMany({
      where: {
        role: "AGENCY_OFFICIAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(agencies);
  } catch (error) {
    console.error("Error fetching agencies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in agencies POST:', session);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, description } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if agency already exists
    const existingAgency = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAgency) {
      return NextResponse.json(
        { error: "Agency with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agency in both User and Agency tables
    const agency = await prisma.$transaction(async (tx) => {
      // First create the agency record
      const agencyRecord = await tx.agency.create({
        data: {
          name,
          description: description || null,
        },
      });

      // Then create the user with the agency ID
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "AGENCY_OFFICIAL",
          agencyId: agencyRecord.id
        } as any,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        agencyId: agencyRecord.id,
      };
    });

    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    console.error("Error creating agency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 