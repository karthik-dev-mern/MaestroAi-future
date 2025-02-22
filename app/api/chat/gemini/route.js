import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Use the existing GOOGLE_API_KEY from your environment
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const getPromptForType = (type, userMessage) => {
  const basePrompt = "You are a career advisor AI assistant. Keep your response concise, between 3-4 sentences. ";
  
  switch (type) {
    case "industry":
      return basePrompt + "Provide insights about industry trends and career opportunities. Focus on: " + userMessage;
    case "resume":
      return basePrompt + "Give advice about resume writing and optimization. Focus on: " + userMessage;
    case "cover":
      return basePrompt + "Provide guidance for writing an effective cover letter. Focus on: " + userMessage;
    case "interview":
      return basePrompt + "Give interview preparation advice and tips. Focus on: " + userMessage;
    default:
      return basePrompt + "Answer this career-related question: " + userMessage;
  }
};

export async function POST(req) {
  try {
    const { message, type } = await req.json();
    
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error("GOOGLE_API_KEY is not configured");
    }
    
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = getPromptForType(type, message);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("[GEMINI_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to get response from AI" },
      { status: 500 }
    );
  }
}
