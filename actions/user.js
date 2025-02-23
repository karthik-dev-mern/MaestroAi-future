import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(values) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await auth().getUser(userId);
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // Update or create user
    const user = await db.user.upsert({
      where: { clerkUserId: userId },
      update: {
        ...values,
      },
      create: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
        ...values,
      },
    });

    // Generate AI insights if industry is provided
    if (values.industry) {
      await generateAIInsights(user);
    }

    revalidatePath("/dashboard");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}

export async function updateUserProfile(data) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const user = await db.user.update({
      where: { clerkUserId: userId },
      data: {
        industry: data.industry,
        experience: parseInt(data.experience),
        skills: data.skills,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { isOnboarded: false, error: "No authenticated user found" };
    }

    // Check if user already exists and is onboarded
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true, experience: true, skills: true }
    });

    // If no user found or missing required fields, consider not onboarded
    if (!dbUser || !dbUser.industry || !dbUser.experience || !dbUser.skills) {
      return { isOnboarded: false };
    }

    return { isOnboarded: true };
  } catch (error) {
    console.error("Error in getUserOnboardingStatus:", error);
    // Return a safe response instead of throwing
    return { isOnboarded: false, error: "Failed to check onboarding status" };
  }
}
