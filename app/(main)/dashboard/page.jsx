import { headers } from 'next/headers';
import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DashboardPage() {
  headers(); // This ensures the page is dynamic

  try {
    const { isOnboarded, error } = await getUserOnboardingStatus();

    // If there's a database error, show a friendly message
    if (error) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center p-8 rounded-lg bg-red-50">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Temporarily Unavailable</h2>
            <p className="text-red-600">We're experiencing some technical difficulties. Please try again in a few minutes.</p>
          </div>
        </div>
      );
    }

    // If not onboarded, redirect to onboarding page
    if (!isOnboarded) {
      redirect("/onboarding");
    }

    const insights = await getIndustryInsights().catch(error => {
      console.error("Error fetching insights:", error);
      return null;
    });

    return (
      <div className="container mx-auto">
        <DashboardView insights={insights || []} />
      </div>
    );
  } catch (error) {
    console.error("Error in DashboardPage:", error);
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
