"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DEFAULT_INSIGHTS = {
  salaryRanges: [
    { role: "Junior Developer", min: 50000, max: 80000, median: 65000, location: "Remote" },
    { role: "Mid-Level Developer", min: 80000, max: 120000, median: 100000, location: "Remote" },
    { role: "Senior Developer", min: 120000, max: 180000, median: 150000, location: "Remote" },
    { role: "Tech Lead", min: 140000, max: 200000, median: 170000, location: "Remote" },
    { role: "Engineering Manager", min: 160000, max: 250000, median: 200000, location: "Remote" }
  ],
  growthRate: 5.5,
  demandLevel: "High",
  topSkills: ["Python", "Cloud Computing", "Machine Learning", "Data Analysis", "Cybersecurity"],
  marketOutlook: "Positive",
  keyTrends: [
    "Remote Work",
    "AI Integration",
    "Cloud Migration",
    "Cybersecurity Focus",
    "Digital Transformation"
  ],
  recommendedSkills: [
    "Cloud Platforms",
    "AI/ML",
    "Data Analytics",
    "DevOps",
    "Security"
  ]
};

export const generateAIInsights = async (industry) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY not found, using default insights");
    return {
      ...DEFAULT_INSIGHTS,
      industry
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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
    console.warn("Using default insights due to API error");
    return {
      ...DEFAULT_INSIGHTS,
      industry
    };
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
      return null;
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
            lastUpdated: new Date(),
            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          },
        });
      } catch (error) {
        console.error("Error creating industry insights:", error);
        // Return default insights if database operation fails
        return {
          ...DEFAULT_INSIGHTS,
          industry: user.industry,
          lastUpdated: new Date(),
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        };
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
            lastUpdated: new Date(),
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
