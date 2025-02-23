import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      console.error("[PROFILE_AUTH_ERROR] No user found");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("[PROFILE_USER_DATA]", {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim()
    });

    const body = await req.json();
    const { industry, skills } = body;

    if (!industry && !skills) {
      console.error("[PROFILE_VALIDATION_ERROR] No industry or skills provided");
      return new NextResponse("No data provided to update", { status: 400 });
    }

    try {
      // First check if the industry exists in IndustryInsight
      let industryToUse = industry;
      if (industry) {
        const existingIndustry = await db.industryInsight.findUnique({
          where: { industry: industry }
        });
        
        if (!existingIndustry) {
          // If industry doesn't exist, temporarily set it to null to avoid foreign key constraint error
          industryToUse = null;
          console.log("[PROFILE_INDUSTRY_WARNING] Industry not found in IndustryInsight:", industry);
        }
      }

      const updatedUser = await db.user.upsert({
        where: {
          clerkUserId: user.id,
        },
        update: {
          industry: industryToUse,
          skills,
        },
        create: {
          clerkUserId: user.id,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName} ${user.lastName}`.trim(),
          imageUrl: user.imageUrl,
          industry: industryToUse,
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
