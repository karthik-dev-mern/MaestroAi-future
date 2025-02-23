import { headers } from 'next/headers';
import { getAssessments } from "@/actions/interview";
import StatsCards from "./_components/stats-cards";
import PerformanceChart from "./_components/performace-chart";
import QuizList from "./_components/quiz-list";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function InterviewPrepPage() {
  try {
    headers(); // This ensures the page is dynamic

    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }

    const assessments = await getAssessments();

    return (
      <div>
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-6xl font-bold gradient-title">
            Interview Preparation
          </h1>
        </div>
        <div className="space-y-6">
          <StatsCards assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in InterviewPrepPage:", error);
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 rounded-lg bg-red-50">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Temporarily Unavailable</h2>
          <p className="text-red-600">We're experiencing some technical difficulties. Please try again in a few minutes.</p>
        </div>
      </div>
    );
  }
}
