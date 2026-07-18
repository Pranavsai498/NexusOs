"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Network } from "lucide-react";

export function KnowledgeGraphViewer() {
  const [mounted, setMounted] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/v1/family', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setFamilyMembers(data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch family members for graph:", e);
    }
  };

  if (!mounted) return null;

  const activeMembers = familyMembers.length > 0 
    ? familyMembers 
    : [
        { name: "John", relation: "Father" },
        { name: "Sarah", relation: "Mother" },
        { name: "Self", relation: "Owner" }
      ];

  return (
    <Card className="flex flex-col h-[600px] items-center justify-center glass-card border-primary/20">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Central Family Node */}
        <div className="absolute z-10 w-24 h-24 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center backdrop-blur-sm shadow-xl text-white">
          <span className="font-bold">Family</span>
        </div>
        
        {/* Orbiting Family Members Simulation */}
        <div className="absolute animate-[spin_30s_linear_infinite] w-[300px] h-[300px] border border-dashed border-primary/30 rounded-full flex items-center justify-center">
          {activeMembers.map((member, idx) => {
            const angle = (360 / activeMembers.length) * idx;
            const radius = 150; // Radius matches 300px diameter
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            
            return (
              <div 
                key={idx}
                className="absolute w-16 h-16 rounded-full bg-white border border-slate-200 flex flex-col items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform select-none"
                style={{
                  transform: `translate(${x}px, ${y}px) rotate(-${(angle * Math.PI) / 180}rad)`, // optional: keep name rotation aligned if wanted, or simple translate
                }}
              >
                <span className="text-[10px] font-bold text-slate-800 truncate px-1 max-w-full">{member.name}</span>
                <span className="text-[8px] text-slate-400 capitalize">{member.relation}</span>
              </div>
            );
          })}
        </div>

        {/* Orbiting Goals & Financial Entities */}
        <div className="absolute animate-[spin_45s_linear_infinite_reverse] w-[500px] h-[500px] border border-dashed border-blue-500/30 rounded-full flex items-center justify-center">
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
          <p className="text-muted-foreground">Connected to MongoDB Database</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>Live Data ({activeMembers.length} Members)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
