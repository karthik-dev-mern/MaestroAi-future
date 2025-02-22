"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const industries = [
  "Software Development",
  "Data Science",
  "Web Development",
  "Cloud Computing",
  "Cybersecurity",
  "Artificial Intelligence",
  "DevOps",
  "Mobile Development",
  "UI/UX Design",
  "Product Management",
];

export default function ProfileSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState("");
  const [industry, setIndustry] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          industry,
          skills: skills.split(",").map(skill => skill.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Tell us about your professional background to get personalized recommendations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <select
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2 rounded-md border bg-background"
                required
              >
                <option value="">Select your industry</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="Enter skills (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Example: React, Node.js, Python, AWS
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
