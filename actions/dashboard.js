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
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Get the current user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("No Clerk user found");
    }

    // Get user's industry
    const user = await db.user.findFirst({
      where: { clerkUserId: userId },
      select: { industry: true },
    });

    if (!user?.industry) {
      return null; // Return null if user hasn't selected an industry
    }

    // Get industry insights
    const insights = await db.industryInsight.findFirst({
      where: { industry: user.industry },
    });

    if (!insights) {
      // If no insights exist, generate default insights
      const defaultInsights = {
        industry: user.industry,
        salaryRanges: [],
        growthRate: 0,
        demandLevel: "Not Available",
        topSkills: [],
        marketOutlook: "Not Available",
        keyTrends: [],
        recommendedSkills: [],
        lastUpdated: new Date(),
        nextUpdate: new Date(),
      };

      // Create default insights in database
      return await db.industryInsight.create({
        data: defaultInsights,
      });
    }

    // Check if industry insights need to be updated
    if (!insights.nextUpdate || new Date() > new Date(insights.nextUpdate)) {
      try {
        const newInsights = await generateAIInsights(user.industry);
        await db.industryInsight.update({
          where: { industry: user.industry },
          data: {
            ...newInsights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
        return await db.industryInsight.findFirst({ where: { industry: user.industry } });
      } catch (error) {
        console.error("Error generating new industry insights:", error);
      }
    }

    return insights;
  } catch (error) {
    console.error("Error in getIndustryInsights:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
}
