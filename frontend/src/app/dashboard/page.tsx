'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, ShieldAlert, Sparkles, TrendingUp, HeartPulse, 
  Landmark, GraduationCap, ArrowRight, BellRing, CalendarClock, 
  AlertCircle, AlertTriangle, CheckCircle, ChevronRight, HelpCircle,
  HelpCircle as QuestionIcon, Plus, Wallet, FileText, BadgeAlert
} from 'lucide-react';

import { Sidebar } from "@/components/navigation/Sidebar";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch('http://localhost:8000/api/v1/dashboard/insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const insights = await res.json();
          setData(insights);
        } else {
          router.push('/login');
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-slate-500 font-medium">Syncing NexusOS fleet...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-8 pb-32">
        {/* Top Header Search Bar */}
        <div className="flex items-center justify-between gap-6 mb-8">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Search documents, bills, or ask Life Brain..." 
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/chat?q=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-0.5 bg-slate-100 rounded-full text-xs font-semibold text-slate-500">⌘K</div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/notifications')}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
            >
              <BellRing className="w-5 h-5" />
              {data.brief.critical_count > 0 && (
                <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full bg-brand-red ring-2 ring-white"></span>
              )}
            </button>
            <div 
              className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-blue transition-all" 
              onClick={() => router.push('/profile')}
            >
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=User" alt="Profile" />
            </div>
          </div>
        </div>

        {/* Dashboard Grid Container */}
        <div className="space-y-8">
          
          {/* 1. Today's AI Brief Widget (Master Widget) */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="w-full bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 text-white rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Background glowing elements */}
            <div className="absolute right-[-10%] top-[-20%] w-[25rem] h-[25rem] bg-brand-blue/20 rounded-full filter blur-[80px] pointer-events-none"></div>
            <div className="absolute left-[30%] bottom-[-20%] w-[20rem] h-[20rem] bg-indigo-500/10 rounded-full filter blur-[60px] pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
              
              {/* Left Column: Greeting & Task Counts */}
              <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase">{data.greeting}</span>
                  <h1 className="text-4xl md:text-5xl font-extrabold font-heading text-white mt-1 tracking-tight">
                    {data.family_name}
                  </h1>
                </div>

                {/* Light Dashboard Counts */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-2xl">
                    <span className="w-2.5 h-2.5 bg-brand-red rounded-full animate-ping"></span>
                    <span className="text-sm font-bold text-red-400">{data.brief.critical_count} Critical Tasks</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl">
                    <span className="w-2.5 h-2.5 bg-brand-amber rounded-full"></span>
                    <span className="text-sm font-bold text-amber-400">{data.brief.upcoming_count} Upcoming</span>
                  </div>
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
                    <span className="w-2.5 h-2.5 bg-brand-green rounded-full"></span>
                    <span className="text-sm font-bold text-emerald-400">{data.brief.completed_count} Completed</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Today's AI Brief</h3>
                  <ul className="space-y-3">
                    {data.brief.bullets.map((bullet: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-slate-300 font-medium text-base">
                        <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          bullet.includes("Critical") || bullet.includes("expires tomorrow") || bullet.includes("due") || bullet.includes("Missing")
                            ? "bg-brand-red shadow-[0_0_8px_#ef4444]" 
                            : "bg-blue-400"
                        }`} />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Savings, Good News & Start Assistant */}
              <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[24px] p-6 flex flex-col justify-between space-y-6">
                <div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Estimated Total Savings</span>
                  <div className="text-4xl font-extrabold text-emerald-400 mt-1 font-sans">
                    ₹{data.brief.estimated_savings.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Through scholarship match, energy optimization & tax refinancing.</p>
                </div>

                {/* Good News Banner */}
                <div className="bg-blue-500/15 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-blue-400 text-xs font-extrabold uppercase block tracking-wider">Good News</span>
                    <p className="text-slate-200 text-sm font-medium mt-1 leading-snug">{data.brief.good_news}</p>
                  </div>
                </div>

                <button 
                  onClick={() => router.push('/chat')}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl text-base font-bold shadow-lg hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group hover:shadow-white/10"
                >
                  Start AI Assistant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              
            </div>
          </motion.div>

          {/* Core Grid Layout for Widgets 2 to 7 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column (8 cols): Critical Alerts, Govt Schemes, Upcoming Bills */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 2. Critical Alerts Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BadgeAlert className="w-6 h-6 text-brand-red" />
                    <h2 className="text-xl font-bold text-slate-950 font-heading">Critical Alerts</h2>
                  </div>
                  <span className="text-xs font-bold bg-red-100 text-brand-red px-2.5 py-1 rounded-full uppercase">Action Needed</span>
                </div>

                <div className="space-y-3">
                  {data.critical_alerts.length === 0 ? (
                    <p className="text-sm text-slate-500 font-medium py-2">No active critical alerts found. Your family profile is secure.</p>
                  ) : (
                    data.critical_alerts.map((alert: any, idx: number) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50/50 border border-red-100 rounded-2xl gap-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-brand-red mt-0.5 shrink-0" />
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{alert.title}</h4>
                            <p className="text-sm text-slate-600 font-medium mt-0.5">{alert.message}</p>
                          </div>
                        </div>
                        <Link 
                          href={`/chat?q=${encodeURIComponent(alert.title)}`}
                          className="py-2 px-4 bg-white border border-red-200 hover:border-brand-red text-brand-red text-sm font-semibold rounded-xl text-center shadow-sm hover:bg-red-50 transition-colors"
                        >
                          Resolve
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* 3. Government Benefits Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-6 h-6 text-brand-amber" />
                    <h2 className="text-xl font-bold text-slate-950 font-heading">Government Benefits</h2>
                  </div>
                  <span className="text-sm font-semibold text-slate-400">Eligibility Matched</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.govt_benefits.length === 0 ? (
                    <p className="text-sm text-slate-500 font-medium py-2 col-span-2">No matched government benefits found. Add family members or upload documents to identify eligible schemes.</p>
                  ) : (
                    data.govt_benefits.map((benefit: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                              benefit.status === 'Eligible' || benefit.status === 'Match Found' ? 'bg-amber-100 text-brand-amber' : 'bg-emerald-100 text-brand-green'
                            }`}>
                              {benefit.status}
                            </span>
                            <span className="text-sm font-bold text-slate-800 font-sans">₹{benefit.amount.toLocaleString()}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mt-2.5 leading-snug">{benefit.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">Deadline: {benefit.deadline}</p>
                        </div>
                        <Link 
                          href={`/chat?q=Apply for ${benefit.name}`}
                          className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-center text-sm font-bold hover:bg-brand-blue transition-colors flex items-center justify-center gap-1"
                        >
                          {benefit.action} <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* 4. Upcoming Bills & EMIs Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-6 h-6 text-brand-blue" />
                    <h2 className="text-xl font-bold text-slate-950 font-heading">Upcoming Bills & EMIs</h2>
                  </div>
                  <span className="text-sm font-semibold text-slate-400">Finance sync active</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {data.upcoming_bills.length === 0 ? (
                    <p className="text-sm text-slate-500 font-medium py-2">No outstanding bills or EMIs detected.</p>
                  ) : (
                    data.upcoming_bills.map((bill: any, idx: number) => (
                      <div key={idx} className="py-4 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base">{bill.title}</h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-slate-500 text-xs">
                            <span>Due: {bill.due_date}</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">{bill.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-extrabold text-slate-900 font-sans">₹{bill.amount.toLocaleString()}</span>
                          <Link 
                            href={`/chat?q=Pay ${bill.title}`}
                            className="py-2 px-4 bg-slate-100 hover:bg-brand-blue hover:text-white text-slate-900 text-xs font-bold rounded-xl shadow-inner transition-all"
                          >
                            Pay Now
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

            </div>

            {/* Right Column (4 cols): Health Summary, Community Insights, AI Predictions */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* 5. Health Summary Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <HeartPulse className="w-6 h-6 text-brand-green" />
                  <h2 className="text-xl font-bold text-slate-950 font-heading">Health Summary</h2>
                </div>

                <div className="space-y-4">
                  {data.health_summary.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium py-2">No health summaries logged. Register family members to start monitoring.</p>
                  ) : (
                    data.health_summary.map((member: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                          <span className="text-xs text-slate-500">{member.relation} • Age {member.age}</span>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full ${
                            member.status === 'Normal' ? 'bg-green-100 text-brand-green' : 'bg-amber-100 text-brand-amber'
                          }`}>
                            {member.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">Checkup: {member.last_checkup}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* 6. Community Insights Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-bold text-slate-950 font-heading">Community Insights</h2>
                </div>

                <div className="space-y-4">
                  {data.community_insights.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium py-2">No community insights available. Data will update once more local profiles are synced.</p>
                  ) : (
                    data.community_insights.map((insight: any, idx: number) => (
                      <div key={idx} className="p-4 bg-indigo-50/30 border border-indigo-50/50 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-indigo-950 text-sm leading-snug">{insight.title}</h4>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">Save {insight.saving}</span>
                        </div>
                        <p className="text-xs text-indigo-950/70 font-medium leading-relaxed">{insight.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

              {/* 7. AI Predictions Widget */}
              <motion.section 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-slate-950 font-heading">AI Predictions</h2>
                </div>

                <div className="space-y-4">
                  {data.ai_predictions.length === 0 ? (
                    <p className="text-xs text-slate-500 font-medium py-2">No predictions generated yet. Continue updating your milestones to feed the forecast radar.</p>
                  ) : (
                    data.ai_predictions.map((pred: any, idx: number) => (
                      <div key={idx} className="p-4 bg-purple-50/30 border border-purple-100 rounded-2xl">
                        <h4 className="font-bold text-slate-900 text-sm">{pred.title}</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">{pred.description}</p>
                        <div className="bg-purple-100/40 mt-3 p-2 rounded-xl border border-purple-100/50">
                          <span className="text-[10px] font-bold text-purple-500 uppercase block tracking-wider">Opportunity</span>
                          <span className="text-xs font-bold text-purple-700 mt-0.5 block">{pred.benefit}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.section>

            </div>

          </div>

          {/* 8. Bottom Widget: Ask NexusOS block */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="w-full bg-slate-100 border border-slate-200 rounded-[24px] p-6 text-center"
          >
            <h3 className="text-lg font-bold text-slate-900 font-heading">Need help with something else?</h3>
            <p className="text-sm text-slate-500 mt-1">Talk to Life Brain to query documents, update family info, or search scholarships.</p>
            <div className="max-w-xl mx-auto mt-4 relative">
              <input 
                type="text" 
                placeholder="Ask NexusOS..." 
                className="w-full py-3.5 pl-6 pr-12 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-brand-blue text-sm text-slate-900 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/chat?q=${encodeURIComponent(e.currentTarget.value)}`);
                  }
                }}
              />
              <button 
                onClick={(e) => {
                  const input = (e.currentTarget.previousSibling as HTMLInputElement);
                  if (input && input.value) router.push(`/chat?q=${encodeURIComponent(input.value)}`);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-brand-blue transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
