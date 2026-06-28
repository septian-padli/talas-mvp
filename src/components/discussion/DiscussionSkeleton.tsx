"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DiscussionSkeleton() {
  return (
    <div className="flex flex-col w-full py-4 border-b border-white/10 text-white font-sans animate-pulse">
      {/* HEADER ROW: Avatar + Author Info */}
      <div className="flex items-start gap-3 w-full">
        {/* Avatar Placeholder */}
        <Skeleton className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />

        {/* Info Column Placeholder */}
        <div className="flex flex-col gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 bg-white/10 rounded-md" />
            <Skeleton className="h-3 w-20 bg-white/5 rounded-md" />
          </div>
          <Skeleton className="h-3 w-14 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* DISCUSSION CONTENT PLACEHOLDER */}
      <div className="mt-3.5 pl-13 flex flex-col gap-2">
        <Skeleton className="h-4 w-[85%] bg-white/10 rounded-md" />
        <Skeleton className="h-4 w-[60%] bg-white/5 rounded-md" />
      </div>

      {/* INTERACTIONS BAR PLACEHOLDER */}
      <div className="flex items-center gap-4 mt-3 pl-13">
        <Skeleton className="h-7 w-24 bg-white/10 rounded-full" />
        <Skeleton className="h-6 w-16 bg-white/5 rounded-md" />
      </div>
    </div>
  );
}
