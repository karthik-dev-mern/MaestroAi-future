"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function getAssessments() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return [];
    }

    const assessments = await db.assessment.findMany({
      where: {
        user: {
          clerkUserId: userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        questions: true
      }
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return [];
  }
}

export async function generateQuiz() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Please sign in to continue");
    }

    // Try to find the user in our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: {
        industry: true,
        skills: true,
      },
    });

    if (!user) {
      throw new Error("Please complete your profile first");
    }

    if (!user.industry || !user.skills?.length) {
      throw new Error("Please complete your profile with industry and skills first");
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("AI service is temporarily unavailable");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Generate 10 technical interview questions for a ${user.industry} professional with expertise in ${user.skills.join(", ")}.
      
      Each question should be multiple choice with 4 options.
      
      Return the response in this JSON format only, no additional text:
      {
        "questions": [
          {
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "correctAnswer": "string",
            "explanation": "string"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
    const quiz = JSON.parse(cleanedText);

    return quiz.questions;
  } catch (error) {
    console.error("Error generating quiz:", error);
    if (error.message.includes("API key")) {
      throw new Error("AI service is temporarily unavailable");
    }
    throw error;
  }
}

export async function saveQuizResult(questions, answers, score) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Please sign in to continue");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("Please complete your profile first");
    }

    const questionResults = questions.map((q, index) => ({
      question: q.question,
      answer: q.correctAnswer,
      userAnswer: answers[index],
      isCorrect: q.correctAnswer === answers[index],
      explanation: q.explanation,
    }));

    const assessment = await db.assessment.create({
      data: {
        score,
        userId: user.id,
        questions: {
          create: questionResults
        }
      },
      include: {
        questions: true
      }
    });

    return assessment;
  } catch (error) {
    console.error("Error saving quiz result:", error);
    throw new Error("Failed to save quiz results");
  }
}
