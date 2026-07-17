"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Network } from "lucide-react";

// In a real implementation, we'd use react-force-graph or react-flow.
// For this hackathon stub, we'll build a simplified CSS/HTML visualizer
// or wait for the actual MCP data to render a generic view.

export function KnowledgeGraphViewer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="flex flex-col h-[600px] items-center justify-center glass-card border-primary/20">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Placeholder Nodes */}
        <div className="absolute z-10 w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center backdrop-blur-sm shadow-xl shadow-primary/10">
          <span className="font-bold text-primary">Family</span>
        </div>
        
        {/* Orbiting Elements Simulation */}
        <div className="absolute animate-[spin_20s_linear_infinite] w-[300px] h-[300px] border border-dashed border-primary/30 rounded-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-secondary border flex flex-col items-center justify-center">
            <span className="text-xs font-semibold">John</span>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-16 h-16 rounded-full bg-secondary border flex flex-col items-center justify-center">
            <span className="text-xs font-semibold">Sarah</span>
          </div>
        </div>

        <div className="absolute animate-[spin_30s_linear_infinite_reverse] w-[500px] h-[500px] border border-dashed border-blue-500/30 rounded-full">
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-card border flex flex-col items-center justify-center">
            <Network className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-[10px] text-center">Mortgage</span>
          </div>
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-card border flex flex-col items-center justify-center">
            <Network className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-[10px] text-center">Education</span>
          </div>
        </div>

        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur text-xs p-3 rounded-lg border">
          <p className="font-semibold mb-1">Knowledge Graph Sync</p>
          <p className="text-muted-foreground">Connected to Neo4j/MongoDB via MCP</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Live Data</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
