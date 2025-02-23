"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // Start a transaction to handle both operations
    const result = await db.$transaction(async (tx) => {
      // First check if industry exists
      let industryInsight = await tx.industryInsight.findUnique({
        where: {
          industry: data.industry,
        },
      });

      // If industry doesn't exist, create it with default values
      if (!industryInsight) {
        const insights = await generateAIInsights(data.industry);

        industryInsight = await tx.industryInsight.create({
          data: {
            industry: data.industry,
            ...insights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }

      // First try to find user by Clerk ID
      let user = await tx.user.findUnique({
        where: { clerkUserId: userId },
      });

      // If not found by Clerk ID, try by email
      if (!user) {
        const email = clerkUser.emailAddresses[0].emailAddress;
        user = await tx.user.findUnique({
          where: { email: email },
        });

        // If found by email, update with new data including clerkUserId
        if (user) {
          user = await tx.user.update({
            where: { email: email },
            data: {
              clerkUserId: userId,
              industry: data.industry,
              experience: data.experience,
              bio: data.bio,
              skills: data.skills,
            },
          });
        } else {
          // If user doesn't exist at all, create new
          user = await tx.user.create({
            data: {
              clerkUserId: userId,
              email: email,
              name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
              imageUrl: clerkUser.imageUrl,
              industry: data.industry,
              experience: data.experience,
              bio: data.bio,
              skills: data.skills || [],
            },
          });
        }
      } else {
        // Update existing user found by clerkUserId
        user = await tx.user.update({
          where: { clerkUserId: userId },
          data: {
            industry: data.industry,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });
      }

      return user;
    });

    revalidatePath("/dashboard");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw new Error(error.message || "Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Get the current user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) throw new Error("No Clerk user found");

    // First try to find user by Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
      },
    });

    // If not found by Clerk ID, try by email
    if (!user) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await db.user.findUnique({
        where: { email: email },
        select: {
          industry: true,
        },
      });

      // If found by email, update the clerkUserId
      if (user) {
        user = await db.user.update({
          where: { email: email },
          data: { clerkUserId: userId },
          select: {
            industry: true,
          },
        });
      } else {
        // If user doesn't exist at all, create new
        user = await db.user.create({
          data: {
            clerkUserId: userId,
            email: email,
            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
            imageUrl: clerkUser.imageUrl,
            skills: [],
          },
          select: {
            industry: true,
          },
        });
      }
    }

    return {
      isOnboarded: !!user?.industry,
    };
  } catch (error) {
    console.error("Error in getUserOnboardingStatus:", error);
    throw new Error(error.message || "Failed to check onboarding status");
  }
}
