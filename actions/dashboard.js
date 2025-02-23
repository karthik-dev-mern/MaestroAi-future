"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAIInsights = async (industry) => {
  const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

  return JSON.parse(cleanedText);
};

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Get the current user from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("No Clerk user found");

  try {
    // Try to find the user in our database
    let user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        industryInsight: true,
      },
    });

    // If user doesn't exist in our database, create them
    if (!user) {
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
          imageUrl: clerkUser.imageUrl,
          skills: [],
        },
        include: {
          industryInsight: true,
        },
      });
      console.log("[USER_CREATED_IN_INSIGHTS]", { userId, email: clerkUser.emailAddresses[0].emailAddress });
    }

    // If user has no industry selected yet
    if (!user.industry) {
      return {
        message: "Please select your industry in your profile first",
        data: null,
      };
    }

    // Check if industry insights need to be updated
    if (!user.industryInsight || new Date() > new Date(user.industryInsight.nextUpdate)) {
      const insights = await generateAIInsights(user.industry);
      
      const updatedInsight = await db.industryInsight.upsert({
        where: {
          industry: user.industry,
        },
        update: {
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
        create: {
          industry: user.industry,
          ...insights,
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        message: "Industry insights updated successfully",
        data: updatedInsight,
      };
    }

    return {
      message: "Industry insights retrieved successfully",
      data: user.industryInsight,
    };
  } catch (error) {
    console.error("Error getting industry insights:", error);
    throw new Error("Failed to get industry insights");
  }
}
