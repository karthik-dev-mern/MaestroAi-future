import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Use the existing GEMINI_API_KEY from your environment
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
    
    if (!message || !type) {
      return new NextResponse("Message and type are required", { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.error("[GEMINI_ERROR] Missing API key");
      return new NextResponse("API configuration error", { status: 500 });
    }
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = getPromptForType(type, message);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      return NextResponse.json({ response: text, success: true });
    } catch (aiError) {
      console.error("[GEMINI_AI_ERROR]", aiError);
      return new NextResponse("Error generating AI response", { status: 500 });
    }
  } catch (error) {
    console.error("[GEMINI_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
