'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, FileText, Calendar, Users, Award, Settings, Sparkles 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Vault', href: '/vault', icon: FileText },
  { name: 'Planning', href: '/planning', icon: Calendar },
  { name: 'Family', href: '/family', icon: Users },
  { name: 'Warranty', href: '/warranty', icon: Award },
  { name: 'Settings', href: '/settings', icon: Settings }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 flex flex-col">
      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
        <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900 font-sans">NexusOS</span>
      </div>
      
      <div className="flex-1 py-8 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden md:block font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <Link 
          href="/chat" 
          className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="hidden md:block font-medium">Ask AI</span>
        </Link>
      </div>
    </aside>
  );
}
