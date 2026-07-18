"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "completed" | "current" | "upcoming";
  category: "finance" | "health" | "education" | "legal" | "general";
};

const defaultEvents: TimelineEvent[] = [
  {
    id: "1",
    title: "Update Health Insurance",
    description: "Annual enrollment period closes soon.",
    date: "Nov 15, 2026",
    status: "completed",
    category: "health"
  },
  {
    id: "2",
    title: "College Fund Milestone",
    description: "Reached 50% of the target for Sarah's 529 plan.",
    date: "Dec 01, 2026",
    status: "current",
    category: "finance"
  },
  {
    id: "3",
    title: "Will & Trust Review",
    description: "Review legal documents with the lawyer.",
    date: "Jan 10, 2027",
    status: "upcoming",
    category: "legal"
  }
];

export function LifeTimeline({ events = defaultEvents }: { events?: TimelineEvent[] }) {
  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
      {events.map((event, index) => {
        const isCompleted = event.status === "completed";
        const isCurrent = event.status === "current";

        return (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : isCurrent ? (
                <Clock className="w-5 h-5 text-blue-500" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-card shadow-sm">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{event.title}</h3>
                  <time className="text-sm text-muted-foreground font-mono">{event.date}</time>
                </div>
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-max bg-secondary text-secondary-foreground">
                  {event.category.toUpperCase()}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
