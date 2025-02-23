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
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { isOnboarded: false, error: "No authenticated user found" };
    }

    // First try to find user by Clerk ID
    const user = await db.user.findUnique({
      where: {
        clerkUserId: clerkUser.id,
      },
    });

    // If no user found or missing required fields, consider not onboarded
    if (!user || !user.industry || !user.experience || !user.skills) {
      return { isOnboarded: false };
    }

    return { isOnboarded: true };
  } catch (error) {
    console.error("Error in getUserOnboardingStatus:", error);
    // Return a safe response instead of throwing
    return { isOnboarded: false, error: "Failed to check onboarding status" };
  }
}
