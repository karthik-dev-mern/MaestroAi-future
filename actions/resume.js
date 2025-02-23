"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // First try to find user by Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // If not found by Clerk ID, try by email
    if (!user) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await db.user.findUnique({
        where: { email: email },
      });

      // If found by email, update the clerkUserId
      if (user) {
        user = await db.user.update({
          where: { email: email },
          data: { clerkUserId: userId },
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
        });
      }
    }

    const resume = await db.resume.upsert({
      where: {
        userId: user.id,
      },
      update: {
        content,
      },
      create: {
        userId: user.id,
        content,
      },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error in saveResume:", error);
    throw new Error(error.message || "Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // First try to find user by Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    // If not found by Clerk ID, try by email
    if (!user) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await db.user.findUnique({
        where: { email: email },
      });

      // If found by email, update the clerkUserId
      if (user) {
        user = await db.user.update({
          where: { email: email },
          data: { clerkUserId: userId },
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
        });
      }
    }

    const resume = await db.resume.findUnique({
      where: {
        userId: user.id,
      },
    });

    return resume;
  } catch (error) {
    console.error("Error in getResume:", error);
    throw new Error(error.message || "Failed to get resume");
  }
}

export async function improveWithAI({ current, type }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // First try to find user by Clerk ID
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
        skills: true,
      },
    });

    // If not found by Clerk ID, try by email
    if (!user) {
      const email = clerkUser.emailAddresses[0].emailAddress;
      user = await db.user.findUnique({
        where: { email: email },
        select: {
          industry: true,
          skills: true,
        },
      });

      // If found by email, update the clerkUserId
      if (user) {
        user = await db.user.update({
          where: { email: email },
          data: { clerkUserId: userId },
          select: {
            industry: true,
            skills: true,
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
            skills: true,
          },
        });
      }
    }

    if (!user.industry) {
      throw new Error("Please complete your profile with industry information first");
    }

    const prompt = `
      As an AI expert in ${user.industry}${
      user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
    }, improve the following ${type}. Make it more professional, impactful, and tailored to the industry while maintaining the core information:

      ${current}

      Return only the improved content, no additional explanations or formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Error in improveWithAI:", error);
    throw new Error(error.message || "Failed to improve content");
  }
}
