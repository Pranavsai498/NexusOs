"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Landmark, 
  Wallet, 
  Activity, 
  GraduationCap, 
  Scale, 
  Network,
  Calendar,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Government", href: "/government", icon: Landmark },
  { name: "Finance", href: "/finance", icon: Wallet },
  { name: "Health", href: "/health", icon: Activity },
  { name: "Education", href: "/education", icon: GraduationCap },
  { name: "Legal", href: "/legal", icon: Scale },
  { name: "Knowledge Graph", href: "/graph", icon: Network },
  { name: "Timeline", href: "/timeline", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card px-4 py-6 text-card-foreground shadow-sm">
      <div className="mb-8 flex items-center justify-center">
        <h1 className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-3xl font-extrabold text-transparent tracking-tight">
          NexusOS
        </h1>
      </div>
      
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-lg bg-primary/10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto border-t pt-4">
        <Link
          href="/settings"
          className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
      </div>
    </div>
  );
}
