'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Check, X, ArrowLeft, ArrowRight, Sparkles, AlertTriangle, 
  Clock, Sun, HelpCircle, Landmark, Activity, GraduationCap, 
  MapPin, Plus, Loader2, CheckCircle2, ChevronRight, Briefcase
} from 'lucide-react';

import { Sidebar } from "@/components/navigation/Sidebar";

export default function PlanningPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tab views
  const [activeTab, setActiveTab] = useState('today'); // today, week, month, long_term

  // Life Event checklist selector
  const [activeEvent, setActiveEvent] = useState<string | null>(null); // moving, car, college
  const [checkedChecklistItems, setCheckedChecklistItems] = useState<Record<string, boolean>>({});

  // Planning Assistant Wizard
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [wizardQuery, setWizardQuery] = useState(''); // today, weekend
  const [wizardResult, setWizardResult] = useState<any | null>(null);

  // Today's task complete checkboxes
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPlanningData(token);
  }, [router]);

  const fetchPlanningData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/planning/insights', {
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

  const handleCheckboxToggle = (taskTitle: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [taskTitle]: !prev[taskTitle]
    }));
  };

  const handleEventChecklistToggle = (itemKey: string) => {
    setCheckedChecklistItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  const triggerWizard = (queryType: string) => {
    setWizardQuery(queryType);
    setShowWizardModal(true);
    
    if (queryType === 'today') {
      setWizardResult({
        title: "Today's Focus Roadmap",
        items: [
          { text: "Pay Electricity Bill", priority: "High" },
          { text: "Submit Sarah's AICTE Scholarship Application", priority: "High" },
          { text: "Renew Health Insurance Policy Cover", priority: "Medium" },
          { text: "Metformin dose tracking (Venkat)", priority: "High" }
        ],
        time: "2 Hours"
      });
    } else {
      setWizardResult({
        title: "Weekend Schedule Guide",
        items: [
          { text: "Saturday Morning: Splendor Bike general service checkup", priority: "Routine" },
          { text: "Saturday Afternoon: Grocery & Household shopping", priority: "Routine" },
          { text: "Saturday Evening: Parents annual cardiology checkup follow-up", priority: "High" },
          { text: "Sunday Morning: Execute Family Monthly budget audit", priority: "Important" }
        ],
        time: "Weekend Plan"
      });
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Orchestrating AI Timelines...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              📅 AI Life Planner
            </h1>
            <p className="mt-2 text-slate-500 font-medium font-sans">
              Schedule family calendar appointments, priorities calendars, and life events checksheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => triggerWizard('today')}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              <HelpCircle className="w-5 h-5 text-slate-500" /> What to do today?
            </button>
            <button 
              onClick={() => triggerWizard('weekend')}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Plan Weekend
            </button>
          </div>
        </div>

        {/* 🌞 Morning Daily Focus Brief Banner (WOW Feature) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10 p-6 rounded-[24px] bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute right-[-10%] top-[-10%] w-[15rem] h-[15rem] bg-brand-blue/20 rounded-full filter blur-[60px] pointer-events-none"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15 backdrop-blur-sm shrink-0">
              <Sun className="w-6 h-6 text-brand-amber animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Morning Daily Focus Brief</span>
              <h2 className="text-xl font-heading font-bold text-white mt-1">Good Morning, Ramesh Family 👋</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-4xl font-medium">
                Today requires attention: **{data.focus_brief.critical_count} Critical Tasks**, **{data.focus_brief.health_reminders} Health Checkup**, and **{data.focus_brief.bills_due} Utilities due**. 
                Completing refinancing can save **₹{data.focus_brief.potential_savings.toLocaleString()}** today. 
                Weather: **{data.focus_brief.weather}** (Estimated Busy Period: {data.focus_brief.busy_hours}).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Today's Tasks</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.today_count}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">This Week</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.week_count}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">This Month</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.month_count}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Long-term Goals</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.goals_count}</div>
          </div>
        </div>

        {/* Plan Tab Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin">
          {[
            { id: 'today', name: 'Today\'s Plan', icon: '🌞' },
            { id: 'week', name: 'Weekly Plan', icon: '📅' },
            { id: 'month', name: 'Monthly Planner', icon: '📅' },
            { id: 'long_term', name: 'Long-Term Goals', icon: '🌍' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Core Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Plan Details Panel (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm min-h-[350px]">
              
              <AnimatePresence mode="wait">
                
                {/* TAB: Today's Plan (AI Priority Engine) */}
                {activeTab === 'today' && (
                  <motion.div 
                    key="tab-today"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Critical tasks */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">🔴 Critical (Must Do Today)</span>
                      <div className="space-y-2">
                        {data.critical.length === 0 ? (
                          <p className="text-xs text-slate-500 font-medium py-2">No critical tasks pending today.</p>
                        ) : (
                          data.critical.map((t: any, idx: number) => {
                            const isDone = completedTasks[t.title];
                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleCheckboxToggle(t.title)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                      isDone ? 'bg-red-500 text-white border-red-500' : 'border-slate-300 hover:border-red-500'
                                    }`}
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {t.title}
                                  </span>
                                </div>
                                <span className="px-2.5 py-1 bg-red-50 text-brand-red rounded font-bold text-[9px]">
                                  {t.time}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Important tasks */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-brand-amber font-extrabold uppercase tracking-widest block">🟠 Important (Within 3 Days)</span>
                      <div className="space-y-2">
                        {data.important.length === 0 ? (
                          <p className="text-xs text-slate-500 font-medium py-2">No important tasks due soon.</p>
                        ) : (
                          data.important.map((t: any, idx: number) => {
                            const isDone = completedTasks[t.title];
                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleCheckboxToggle(t.title)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                      isDone ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-300 hover:border-amber-500'
                                    }`}
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {t.title}
                                  </span>
                                </div>
                                <span className="px-2.5 py-1 bg-amber-50 text-brand-amber rounded font-bold text-[9px]">
                                  {t.due}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Normal tasks */}
                    <div className="space-y-3">
                      <span className="text-[10px] text-brand-green font-extrabold uppercase tracking-widest block">🟢 Normal (This Week)</span>
                      <div className="space-y-2">
                        {data.normal.length === 0 ? (
                          <p className="text-xs text-slate-500 font-medium py-2">No weekly routine tasks outstanding.</p>
                        ) : (
                          data.normal.map((t: any, idx: number) => {
                            const isDone = completedTasks[t.title];
                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => handleCheckboxToggle(t.title)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                                      isDone ? 'bg-green-500 text-white border-green-500' : 'border-slate-300 hover:border-green-500'
                                    }`}
                                  >
                                    {isDone && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {t.title}
                                  </span>
                                </div>
                                <span className="px-2.5 py-1 bg-green-50 text-brand-green rounded font-bold text-[9px]">
                                  {t.due}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* TAB: Weekly Plan */}
                {activeTab === 'week' && (
                  <motion.div 
                    key="tab-week"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Weekly Timeline Agenda</span>
                    <div className="space-y-3">
                      {data.weekly.length === 0 ? (
                        <p className="text-xs text-slate-500 font-medium py-2">No weekly timeline milestones logged.</p>
                      ) : (
                        data.weekly.map((w: any, idx: number) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs font-bold text-slate-700">
                            <span>{w.task}</span>
                            <span className="text-brand-blue bg-blue-50 px-2 py-0.5 rounded">{w.day}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* TAB: Monthly Planner */}
                {activeTab === 'month' && (
                  <motion.div 
                    key="tab-month"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Filing Totals: July</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">EMIs Due</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">{data.monthly.emis}</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Insurance Coverages</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">{data.monthly.insurance_renewals}</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Govt Claims</span>
                        <div className="text-3xl font-black text-slate-900 mt-2">{data.monthly.govt_applications}</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB: Long Term Planner */}
                {activeTab === 'long_term' && (
                  <motion.div 
                    key="tab-long"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Milestone Goals</span>
                    <div className="space-y-5">
                      {data.long_term.length === 0 ? (
                        <p className="text-xs text-slate-500 font-medium py-2">No long-term milestone goals found.</p>
                      ) : (
                        data.long_term.map((g: any, idx: number) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>{g.milestone} ({g.year})</span>
                              <span>{g.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className="bg-slate-900 h-full rounded-full" style={{ width: `${g.progress}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>

            {/* WOW Feature: AI Life Event Planner checklist */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-heading font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-blue animate-pulse" /> AI Life Event Planner
                </h3>
                <p className="text-xs text-slate-400 font-semibold mt-1">Select a scenario event to automatically generate checklists across 6 pillars.</p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {[
                  { id: 'moving', name: 'We are moving to Hyderabad' },
                  { id: 'car', name: 'We bought a new car' },
                  { id: 'college', name: 'Sarah joined college' }
                ].map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => {
                      setActiveEvent(ev.id);
                      setCheckedChecklistItems({});
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeEvent === ev.id 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {ev.name}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeEvent && (
                  <motion.div 
                    key={activeEvent}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-3"
                  >
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Dynamic Checklist Checklist</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.checklists[activeEvent].map((item: string, idx: number) => {
                        const itemKey = `${activeEvent}_${idx}`;
                        const isChecked = checkedChecklistItems[itemKey];
                        return (
                          <div 
                            key={idx} 
                            className="flex items-center gap-2.5 text-xs text-slate-700 font-bold"
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked || false}
                              onChange={() => handleEventChecklistToggle(itemKey)}
                              className="rounded text-brand-blue focus:ring-brand-blue" 
                            />
                            <span className={isChecked ? 'line-through text-slate-400' : ''}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Sidebar Planners (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. Shared Family Calendar */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Family Calendar Today</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                {data.calendar.map((cal: any, idx: number) => (
                  <div key={idx} className="py-3.5 flex justify-between items-center gap-3 first:pt-0 last:pb-0 text-xs font-semibold">
                    <div>
                      <h4 className="text-slate-800 font-extrabold leading-tight">{cal.event}</h4>
                      <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">{cal.member}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-brand-blue rounded font-bold text-[9px] whitespace-nowrap">
                      {cal.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Forecasts Alert checks */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Planning Forecasts</h2>
              <div className="space-y-4">
                {!data.predictions || data.predictions.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium py-2">No active forecasts found.</p>
                ) : (
                  data.predictions.map((pred: string, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm text-xs font-bold text-slate-700 leading-normal flex gap-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-brand-amber shrink-0 mt-0.5" />
                      <span>{pred}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Interactive Planning Assistant Guide modal */}
      <AnimatePresence>
        {showWizardModal && wizardResult && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-950 flex items-center gap-2">
                  🧠 AI Planning Guide
                </h3>
                <button onClick={() => setShowWizardModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-500/10 border border-purple-250 p-5 rounded-2xl">
                  <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">
                    {wizardResult.title}
                  </span>
                  <div className="space-y-3 mt-4 text-xs font-semibold text-slate-700">
                    {wizardResult.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center border-b border-white/20 pb-2 last:border-0 last:pb-0">
                        <span>{item.text}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          item.priority === 'High' ? 'bg-red-100 text-brand-red' : item.priority === 'Important' ? 'bg-amber-100 text-brand-amber' : 'bg-slate-150 text-slate-600'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mt-4 pt-2 border-t border-white/20">
                    <span>Estimated Buffer Time</span>
                    <span>{wizardResult.time}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowWizardModal(false);
                    router.push('/chat?q=Help me prioritize my planning task checklist');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md text-xs cursor-pointer"
                >
                  Discuss with AI Chief of Staff
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
