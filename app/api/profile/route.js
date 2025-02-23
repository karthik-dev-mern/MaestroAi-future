import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { industry, skills } = body;

    const updatedUser = await db.user.update({
      where: {
        clerkUserId: user.id,
      },
      data: {
        industry,
        skills,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
