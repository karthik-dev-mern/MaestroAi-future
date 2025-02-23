"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateAIInsights = async (industry) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI service is temporarily unavailable");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
  } catch (error) {
    console.error("Error generating AI insights:", error);
    if (error.message.includes("API key")) {
      throw new Error("AI service is temporarily unavailable");
    }
    throw new Error("Failed to generate industry insights");
  }
};

export async function getIndustryInsights() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    // Get user's industry
    const user = await db.user.findUnique({
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
      // If no insights exist, generate new insights
      try {
        const newInsights = await generateAIInsights(user.industry);
        return await db.industryInsight.create({
          data: {
            industry: user.industry,
            ...newInsights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
      } catch (error) {
        console.error("Error creating industry insights:", error);
        return null;
      }
    }

    // Check if industry insights need to be updated
    if (!insights.nextUpdate || new Date() > new Date(insights.nextUpdate)) {
      try {
        const newInsights = await generateAIInsights(user.industry);
        return await db.industryInsight.update({
          where: { industry: user.industry },
          data: {
            ...newInsights,
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
      } catch (error) {
        console.error("Error updating industry insights:", error);
        return insights; // Return existing insights if update fails
      }
    }

    return insights;
  } catch (error) {
    console.error("Error in getIndustryInsights:", error);
    return null;
  }
}
