import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { message, type } = body;

    if (!message || !type) {
      return new NextResponse("Message and type are required", { status: 400 });
    }

    // Here you would typically call your AI service
    // For now, we'll return mock responses with better error handling
    let response = "";
    try {
      switch (type) {
        case "industry":
          response = "Based on current trends, the tech industry is showing strong growth in AI and machine learning roles. Would you like specific insights about a particular sector?";
          break;
        case "resume":
          response = "I can help you create a professional resume. What's your target role and industry?";
          break;
        case "cover":
          response = "Let's craft a compelling cover letter. Which company and position are you applying for?";
          break;
        case "interview":
          response = "I'll help you prepare for your interview. What role are you interviewing for?";
          break;
        default:
          response = "How can I assist you with your career development today?";
      }

      return NextResponse.json({ response, success: true });
    } catch (innerError) {
      console.error("[CHAT_RESPONSE_ERROR]", innerError);
      return new NextResponse("Error generating response", { status: 500 });
    }
  } catch (error) {
    console.error("[CHAT_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
