"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Brain, Rocket, ArrowRight } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading";
import { useRouter } from "next/navigation";

const HeroSection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState({
    journey: false,
    learn: false
  });

  const handleClick = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    // Simulate loading for demo
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(type === 'journey' ? '/dashboard' : '/about');
  };

  return (
    <section className="relative w-full min-h-[90vh] overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-pattern" />
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] animate-pulse animation-delay-4000" />
      </div>

      <div className="relative container mx-auto px-4 min-h-[90vh] flex flex-col items-center justify-center">
        <div className="text-center space-y-8 animate-fade-in max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-block animate-slide-up">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 mr-2 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Next-Gen Career Guidance</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up animation-delay-200">
            <span className="inline-block mb-4 bg-gradient-to-r from-primary via-purple-500 to-blue-500 bg-clip-text text-transparent">
              MaestroAI
            </span>
            <br />
            <span className="inline-block text-3xl md:text-5xl lg:text-6xl text-foreground/90">
              Your Intelligent Career Partner
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed animate-slide-up animation-delay-400">
            Experience the future of career development with our AI-powered platform. 
            Get personalized guidance, master interview skills, and unlock your professional potential.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-slide-up animation-delay-600">
            <Button 
              size="lg" 
              onClick={() => handleClick('journey')}
              disabled={loading.journey}
              className={`group h-12 px-8 text-base bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all duration-200 ${loading.journey ? 'loading-button' : ''}`}
            >
              {loading.journey ? (
                <span className="flex items-center">
                  Loading<LoadingDots />
                </span>
              ) : (
                <>
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => handleClick('learn')}
              disabled={loading.learn}
              className={`h-12 px-8 text-base hover:bg-primary/5 ${loading.learn ? 'loading-button' : ''}`}
            >
              {loading.learn ? (
                <span className="flex items-center">
                  Loading<LoadingDots />
                </span>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Learn More
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
};

export default HeroSection;
