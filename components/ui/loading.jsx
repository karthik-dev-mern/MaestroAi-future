import React from "react";

export const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full min-h-[60vh]">
    <div className="relative">
      <div className="w-12 h-12 rounded-full absolute border-4 border-solid border-primary"></div>
      <div className="w-12 h-12 rounded-full animate-spin absolute border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  </div>
);

export const LoadingDots = () => (
  <span className="inline-flex items-center gap-px">
    <span className="animate-blink mx-0.5 inline-block h-2 w-2 rounded-full bg-current"></span>
    <span className="animate-blink animation-delay-150 mx-0.5 inline-block h-2 w-2 rounded-full bg-current"></span>
    <span className="animate-blink animation-delay-300 mx-0.5 inline-block h-2 w-2 rounded-full bg-current"></span>
  </span>
);

export const LoadingPulse = () => (
  <div className="relative w-full overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent">
    <div className="space-y-4">
      <div className="h-8 w-full animate-pulse rounded bg-primary/10"></div>
      <div className="h-8 w-3/4 animate-pulse rounded bg-primary/10"></div>
      <div className="h-8 w-1/2 animate-pulse rounded bg-primary/10"></div>
    </div>
  </div>
);
