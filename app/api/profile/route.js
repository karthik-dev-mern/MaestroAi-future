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

    if (!industry && !skills) {
      return new NextResponse("No data provided to update", { status: 400 });
    }

    try {
      const updatedUser = await db.user.upsert({
        where: {
          clerkUserId: user.id,
        },
        update: {
          industry,
          skills,
        },
        create: {
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
          imageUrl: user.imageUrl,
          industry,
          skills: skills || [],
        },
      });

      return NextResponse.json(updatedUser);
    } catch (dbError) {
      console.error("[PROFILE_DB_ERROR]", dbError);
      return new NextResponse(
        JSON.stringify({
          error: "Database operation failed",
          details: process.env.NODE_ENV === "development" ? dbError.message : undefined
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[PROFILE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
