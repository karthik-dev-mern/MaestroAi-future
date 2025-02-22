import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { industry, skills } = body;

    const user = await db.user.update({
      where: {
        clerkUserId: userId,
      },
      data: {
        industry,
        skills,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
