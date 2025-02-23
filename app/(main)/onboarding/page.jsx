import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import OnboardingForm from "./_components/onboarding-form";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OnboardingPage() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    // Check if user already exists and is onboarded
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true }
    });

    // If user exists and has industry set, redirect to dashboard
    if (dbUser?.industry) {
      redirect("/dashboard");
    }

    return (
      <div className="container mx-auto py-10">
        <OnboardingForm />
      </div>
    );
  } catch (error) {
    console.error("Error in OnboardingPage:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 rounded-lg bg-red-50">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Something went wrong</h2>
          <p className="text-red-600">Please refresh the page or try again later.</p>
        </div>
      </div>
    );
  }
}
