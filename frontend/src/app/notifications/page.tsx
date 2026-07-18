'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, ArrowLeft, Loader2, Sparkles, Check, AlertTriangle, 
  Clock, ShieldAlert, Award, Landmark, Activity, GraduationCap, 
  MapPin, Heart, Plus, FileText, ChevronRight, CheckCircle2, ShieldCheck
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Health', icon: '🩺' },
  { name: 'Finance', icon: '💰' },
  { name: 'Government', icon: '🏛️' },
  { name: 'Education', icon: '🎓' },
  { name: 'Legal', icon: '⚖️' },
  { name: 'Assets', icon: '🏠' },
  { name: 'Documents', icon: '📄' },
  { name: 'Family', icon: '👥' },
  { name: 'Personal', icon: '📅' },
  { name: 'Vehicles', icon: '🚗' }
];

export default function NotificationsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active filters
  const [activeTab, setActiveTab] = useState('critical'); // critical, important, upcoming
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Completed items tracking
  const [completedReminders, setCompletedReminders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchRemindersData(token);
  }, [router]);

  const fetchRemindersData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/notifications/reminders-insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const insights = await res.json();
        setData(insights);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (id: string, title: string) => {
    alert(`Initiating action for: ${title}`);
    setCompletedReminders(prev => ({
      ...prev,
      [id]: true
    }));
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Calibrating Escalation Alarms...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900 font-sans">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
            { name: 'Vault', path: '/vault', icon: '📂' },
            { name: 'Planning', path: '/planning', icon: '🗓️' },
            { name: 'Family', path: '/family', icon: '👥' },
            { name: 'Settings', path: '/settings', icon: '⚙️' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                item.name === 'Dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:block font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-slate-800" /> Smart Reminders
            </h1>
            <p className="mt-1 text-slate-500 font-medium font-sans">
              Dynamic multi-stage warning schedules, priority checklist pings, and escalation maps.
            </p>
          </div>
          
          <button 
            onClick={() => {
              const token = localStorage.getItem('token');
              if (token) fetchRemindersData(token);
            }} 
            className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
          >
            Refresh Alerts
          </button>
        </div>

        {/* 1. Roster Priorities Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <button 
            onClick={() => setActiveTab('critical')}
            className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all ${
              activeTab === 'critical' ? 'bg-red-50 border-red-200 shadow-sm' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🔴 Critical today</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.critical_count}</div>
          </button>
          
          <button 
            onClick={() => setActiveTab('important')}
            className={`p-5 rounded-3xl border text-left flex flex-col justify-between transition-all ${
              activeTab === 'important' ? 'bg-amber-50 border-amber-250 shadow-sm' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🟠 Important (3 Days)</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.important_count}</div>
          </button>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🟢 Upcoming (30 Days)</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.upcoming_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">✅ Completed Tasks</span>
            <div className="text-3xl font-black text-brand-green mt-2">{data.summary.completed_count}</div>
          </div>
        </div>

        {/* 2. Categories filter grid */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === null 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Reminders
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.name 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Core Layout Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Priorities Alert Deck (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Contextual Alerts</h2>
            
            <div className="space-y-6">
              {activeTab === 'critical' && (
                data.critical
                  .filter((item: any) => activeCategory ? item.category === activeCategory : true)
                  .map((item: any) => {
                    const isDone = completedReminders[item.id];
                    return (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6 relative overflow-hidden">
                        {isDone && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-15">
                            <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-brand-green font-extrabold text-xs rounded-xl shadow-sm">
                              ✓ Completed
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="px-2 py-0.5 bg-red-100 text-brand-red font-extrabold text-[10px] uppercase rounded">
                              {item.category} • Critical
                            </span>
                            <h3 className="font-heading font-extrabold text-slate-900 text-lg mt-3">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{item.message}</p>
                          </div>
                          <span className="text-xs font-black text-brand-red bg-red-50/50 border border-red-100 px-3 py-1 rounded-xl">
                            Due {item.due}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs font-bold">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase">Estimated Late Fee</span>
                            <span className="text-slate-800 font-black mt-0.5 block">{item.late_fee === "Coverage Interruption" ? "Coverage Interruption" : `₹${item.late_fee.toLocaleString()}`}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleActionClick(item.id, item.title)}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl shadow-md transition-colors"
                          >
                            Resolve Alert
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}

              {activeTab === 'important' && (
                data.important
                  .filter((item: any) => activeCategory ? item.category === activeCategory : true)
                  .map((item: any) => {
                    const isDone = completedReminders[item.id];
                    return (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden">
                        {isDone && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center z-15">
                            <span className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-brand-green font-extrabold text-xs rounded-xl shadow-sm">
                              ✓ Completed
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="px-2 py-0.5 bg-amber-100 text-brand-amber font-extrabold text-[10px] uppercase rounded">
                              {item.category} • Important
                            </span>
                            <h3 className="font-heading font-extrabold text-slate-900 text-lg mt-3">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-semibold mt-1">{item.message}</p>
                          </div>
                          <span className="text-xs font-bold text-brand-amber bg-amber-50/50 border border-amber-100 px-3 py-1 rounded-xl">
                            Due {item.due}
                          </span>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex justify-end">
                          <button 
                            onClick={() => handleActionClick(item.id, item.title)}
                            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs transition-colors hover:bg-brand-blue"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* WOW: Multi-Stage Escalation path timelines map */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-blue animate-pulse" /> Multi-Stage Reminder Escalation
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Schedules alert intensities naturally to reduce notification fatigue.</p>
              </div>

              <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-4">
                {data.escalation.map((stage: any, idx: number) => (
                  <div key={idx} className="relative">
                    <span className="absolute left-[-31px] top-1.5 w-4 h-4 bg-slate-900 rounded-full ring-4 ring-slate-100"></span>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-700">{stage.desc}</span>
                      <span className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{stage.stage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Groupings & Proximity maps (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 3. Smart Grouping Card */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Smart Notification Groupings</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{data.grouping.title}</h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">Grouped to reduce notification clutter</span>
                  </div>
                  
                  <div className="space-y-1.5 border-t border-b border-slate-200/60 py-3 text-xs font-semibold text-slate-600">
                    {data.grouping.items.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Estimated Completion time</span>
                    <span className="text-slate-800">{data.grouping.estimated_time}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Location Proximity Alerts */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Location Proximity Matching</h2>
              <div className="space-y-4">
                {data.location_alerts.map((al: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{al.title}</h4>
                        <p className="text-xs text-slate-500 font-semibold mt-1.5 leading-relaxed">{al.message}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => alert(`Scheduling appointment: ${al.title}`)}
                      className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue shadow-inner transition-colors"
                    >
                      {al.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Predictions */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Reminder Predictions</h2>
              <div className="space-y-4">
                {data.predictions.map((pred: string, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-xs font-bold text-slate-700 leading-normal flex gap-2">
                    <AlertTriangle className="w-4.5 h-4.5 text-brand-amber shrink-0 mt-0.5" />
                    <span>{pred}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
