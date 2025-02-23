import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    // Validate required fields
    if (!data.industry || !data.experience || !data.skills) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update or create user profile
    const user = await db.user.upsert({
      where: { clerkUserId: userId },
      update: {
        industry: data.industry,
        experience: parseInt(data.experience),
        skills: data.skills,
      },
      create: {
        clerkUserId: userId,
        industry: data.industry,
        experience: parseInt(data.experience),
        skills: data.skills,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error in profile API:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
