"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  PenBox,
  LayoutDashboard,
  FileText,
  GraduationCap,
  ChevronDown,
  StarsIcon,
  Users,
  Sparkles,
  Music2,
} from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingDots } from "@/components/ui/loading";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [loading, setLoading] = useState({
    about: false,
    insights: false,
    resume: false,
    cover: false,
    interview: false
  });

  const handleNavigation = async (path, type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    // Simulate loading for demo
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push(path);
    setLoading(prev => ({ ...prev, [type]: false }));
  };

  return (
    <header className="fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2 group mr-8">
          <div className="relative flex items-center">
            <Music2 className="w-6 h-6 text-primary absolute -left-2 -top-2 animate-pulse" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              MaestroAI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex-1 flex justify-center items-center space-x-1 md:space-x-4">
          <SignedIn>
            <Button
              variant="ghost"
              onClick={() => handleNavigation('/about', 'about')}
              disabled={loading.about}
              className={`hidden md:inline-flex items-center gap-2 ${loading.about ? 'loading-button' : ''}`}
            >
              {loading.about ? (
                <span className="flex items-center">
                  Loading<LoadingDots />
                </span>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  About Us
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={() => handleNavigation('/dashboard', 'insights')}
              disabled={loading.insights}
              className={`hidden md:inline-flex items-center gap-2 ${loading.insights ? 'loading-button' : ''}`}
            >
              {loading.insights ? (
                <span className="flex items-center">
                  Loading<LoadingDots />
                </span>
              ) : (
                <>
                  <LayoutDashboard className="h-4 w-4" />
                  Industry Insights
                </>
              )}
            </Button>

            {/* Growth Tools Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <StarsIcon className="h-4 w-4" />
                  <span className="hidden md:block">Growth Tools</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => handleNavigation('/resume', 'resume')}
                    className="w-full flex items-center gap-2"
                  >
                    {loading.resume ? (
                      <span className="flex items-center">
                        Loading<LoadingDots />
                      </span>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Build Resume
                      </>
                    )}
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => handleNavigation('/ai-cover-letter', 'cover')}
                    className="w-full flex items-center gap-2"
                  >
                    {loading.cover ? (
                      <span className="flex items-center">
                        Loading<LoadingDots />
                      </span>
                    ) : (
                      <>
                        <PenBox className="h-4 w-4" />
                        Cover Letter
                      </>
                    )}
                  </button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <button
                    onClick={() => handleNavigation('/interview', 'interview')}
                    className="w-full flex items-center gap-2"
                  >
                    {loading.interview ? (
                      <span className="flex items-center">
                        Loading<LoadingDots />
                      </span>
                    ) : (
                      <>
                        <GraduationCap className="h-4 w-4" />
                        Interview Prep
                      </>
                    )}
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          <SignedOut>
            <SignInButton>
              <Button variant="default" size="sm" className="loading-button">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                  userButtonPopoverCard: "shadow-xl",
                  userPreviewMainIdentifier: "font-semibold",
                },
              }}
              afterSignOutUrl="/"
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
