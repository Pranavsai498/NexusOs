"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Calendar, Lightbulb, ArrowRight, ShieldCheck, Scale } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col space-y-8 pb-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to NexusOS</h1>
        <p className="text-muted-foreground text-lg">
          Your AI-powered Family Life Management Platform.
        </p>
      </div>

      <motion.div 
        variants={container} 
        initial="hidden" 
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="glass-card border-none bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <ShieldCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">All Systems Online</div>
              <p className="text-xs text-muted-foreground mt-1">
                Life Brain & MCP Servers active
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Graph</CardTitle>
              <Network className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">142 Entities</div>
              <p className="text-xs text-muted-foreground mt-1">
                +12 new connections this week
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3 Actions Needed</div>
              <p className="text-xs text-muted-foreground mt-1">
                Insurance renewal in 5 days
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="glass-card bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Life Brain Insights</CardTitle>
              <Lightbulb className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-sm mt-2">
                "Based on your recent document uploads, you may be eligible for the new state education grant."
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
            <CardDescription>Access your family's core modules.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/graph">
              <Button variant="outline" className="w-full justify-between h-auto py-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold">Knowledge Graph</span>
                  <span className="text-xs text-muted-foreground font-normal">View relationships</span>
                </div>
                <Network className="h-5 w-5 text-primary" />
              </Button>
            </Link>
            <Link href="/timeline">
              <Button variant="outline" className="w-full justify-between h-auto py-4">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-semibold">Life Timeline</span>
                  <span className="text-xs text-muted-foreground font-normal">Track family goals</span>
                </div>
                <Calendar className="h-5 w-5 text-primary" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>AI Planning Recommendations</CardTitle>
            <CardDescription>Generated by the Planning Agent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border p-4 bg-accent/50 transition-colors hover:bg-accent">
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Create a College Savings Goal</p>
                <p className="text-sm text-muted-foreground">
                  Your child turns 10 this year. Starting a 529 plan now could yield significant tax benefits.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0"><ArrowRight className="h-4 w-4"/></Button>
            </div>
            
            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-accent">
              <div className="rounded-full bg-primary/20 p-2 text-primary">
                <Scale className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">Update Estate Planning Docs</p>
                <p className="text-sm text-muted-foreground">
                  We noticed your will hasn't been updated since your last property purchase.
                </p>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0"><ArrowRight className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
