"use client";

import { LifeTimeline } from "@/components/timeline/LifeTimeline";

export default function TimelinePage() {
  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Life Timeline</h1>
        <p className="text-muted-foreground mt-2">
          Track upcoming family goals, legal requirements, and health milestones.
        </p>
      </div>

      <div className="py-8">
        <LifeTimeline />
      </div>
    </div>
  );
}
