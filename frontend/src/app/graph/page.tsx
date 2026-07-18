"use client";

import { KnowledgeGraphViewer } from "@/components/graph/KnowledgeGraphViewer";

export default function GraphPage() {
  return (
    <div className="flex flex-col space-y-6 h-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Family Knowledge Graph</h1>
        <p className="text-muted-foreground mt-2">
          Visualize the AI-extracted relationships between family members, documents, finances, and goals.
        </p>
      </div>

      <div className="flex-1">
        <KnowledgeGraphViewer />
      </div>
    </div>
  );
}
