import { headers } from 'next/headers';
import { getResume } from "@/actions/resume";
import ResumeBuilder from "./_components/resume-builder";

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function ResumePage() {
  headers(); // This ensures the page is dynamic
  const resume = await getResume();

  return (
    <div className="container mx-auto py-6">
      <ResumeBuilder initialContent={resume?.content} />
    </div>
  );
}
