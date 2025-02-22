import React from "react";
import { Users, Code, Database, Palette, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Karthik",
      role: "Full Stack Developer",
      description: "Lead developer with expertise in full-stack web development, architecting scalable solutions and implementing modern tech stacks.",
      icon: Code,
    },
    {
      name: "Devaditta Patra",
      role: "Backend Developer",
      description: "Specialized in building robust backend systems, API development, and database optimization.",
      icon: Database,
    },
    {
      name: "Shreeshanth Shetty",
      role: "UI/UX Designer",
      description: "Creative designer focused on creating intuitive user interfaces and engaging user experiences.",
      icon: Palette,
    },
    {
      name: "Nilanjan",
      role: "UI/UX Designer",
      description: "Innovative designer specializing in user-centered design principles and modern design patterns.",
      icon: Palette,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="pt-20 pb-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            Meet Our Team
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a passionate team of developers and designers dedicated to revolutionizing career
            guidance through AI technology. Our mission is to empower individuals in their professional
            journey with intelligent insights and personalized recommendations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            return (
              <div
                key={index}
                className="group relative bg-card rounded-lg border shadow-sm hover:shadow-md transition-all duration-300 p-6"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{member.name}</h3>
                    <h4 className="text-sm font-medium text-primary mb-2">{member.role}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{member.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center my-16 bg-card rounded-lg border p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To create an AI-powered platform that makes career guidance accessible, personalized, and
            effective for everyone. We combine cutting-edge technology with human expertise to deliver
            the best possible career development solutions.
          </p>
        </div>
      </div>
    </div>
  );
}
