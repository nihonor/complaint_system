import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/app/auth/authOptions";
import prisma from "@/prisma/client";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const complaints = await prisma.complaint.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        agency: { select: { name: true } },
      },
    });
    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching recent complaints:", error);
    return NextResponse.json({ error: "Error fetching recent complaints" }, { status: 500 });
  }
} 