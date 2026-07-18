'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Search, ShieldAlert, Sparkles, TrendingUp, HeartPulse, 
  Landmark, GraduationCap, ArrowRight, BellRing, Settings,
  AlertCircle, Shield, FileText, CalendarClock, BookOpen, AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasDueInsurance, setHasDueInsurance] = useState(false);
  const [hasDueBills, setHasDueBills] = useState(false);

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
        
        // Fetch bills to check for insurance due status and utility deadlines
        const billsRes = await fetch('http://localhost:8000/api/v1/finance/bills', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (billsRes.ok) {
          const billsData = await billsRes.json();
          // Check for any unpaid insurance premiums
          const insuranceDue = billsData.some((b: any) => b.record_type === 'Insurance' && b.status !== 'Paid');
          setHasDueInsurance(insuranceDue);
          
          // Check for any general bills due within 5 days
          const today = new Date();
          today.setHours(0,0,0,0);
          const billsNearDeadline = billsData.some((b: any) => {
            if (b.status === 'Paid') return false;
            const due = new Date(b.due_date);
            due.setHours(0,0,0,0);
            const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 5 && diffDays >= 0;
          });
          setHasDueBills(billsNearDeadline);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar (Minimal) */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {['Dashboard', 'Planning', 'Family', 'Vault', 'Settings', 'Warranty'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <Link href="/chat" className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-blue to-indigo-600 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
            <Sparkles className="w-5 h-5" />
            <span className="hidden md:block font-medium">Ask AI</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        {/* Global Search & Top Bar */}
        <div className="flex items-center justify-between gap-6 mb-12">
          <div className="flex-1 max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
            <input 
              type="text" 
              placeholder="Ask Nexus AI to find documents, analyze budget, or check schemes..." 
              className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/chat?q=${encodeURIComponent(e.currentTarget.value)}`);
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-slate-500">⌘K</div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/notifications')}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors relative"
            >
              <BellRing className="w-5 h-5" />
              {(hasDueInsurance || hasDueBills) && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-brand-red ring-2 ring-white"></span>
              )}
            </button>
            <div 
              className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-blue transition-all" 
              onClick={() => router.push('/profile')}
            >
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=User" alt="Profile" title="View Profile" />
            </div>
          </div>
        </div>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 tracking-tight">
            Good Evening, <span className="text-slate-500">Family</span>
          </h1>
          <p className="mt-2 text-lg text-slate-500 font-medium">All family agents are synced and running optimally.</p>
        </motion.div>

        {/* Score Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-green/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green">
                <HeartPulse className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-brand-green/10 text-brand-green font-bold text-lg rounded-full">{data.health_score}/100</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-xl">Health Score</h3>
              <p className="text-sm text-slate-500 mt-1">Based on connected records.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-blue/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-brand-blue/10 text-brand-blue font-bold text-lg rounded-full">{data.financial_score}/100</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-xl">Financial Score</h3>
              <p className="text-sm text-slate-500 mt-1">Based on budget and tracking.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-brand-amber/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-brand-amber/10 flex items-center justify-center text-brand-amber">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-brand-amber/10 text-brand-amber font-bold text-lg rounded-full">{data.govt_score}/100</span>
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-xl">Govt Benefits</h3>
              <p className="text-sm text-slate-500 mt-1">Eligibility matched scores.</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Family Services (Features Navigation) */}
        <div className="mb-12">
          <h2 className="text-2xl font-heading font-bold text-slate-900 mb-6">Quick Family Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Health & Life Insurance Card with Red Alert dot */}
            <Link href="/health" className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-red-200">
              {hasDueInsurance && (
                <span className="absolute top-4 right-4 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-red"></span>
                </span>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">
                  Health & Life Insurance
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {hasDueInsurance ? "⚠️ Premium payment due!" : "All premiums paid."}
                </p>
              </div>
            </Link>

            {/* Bills & Payments Card with 5-day warning alert */}
            <Link href="/finance" className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-amber-200">
              {hasDueBills && (
                <span className="absolute top-4 right-4 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-amber opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-amber"></span>
                </span>
              )}
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-green flex items-center justify-center">
                  <Landmark className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">
                  Bills & Loans (EMI)
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {hasDueBills ? "⚠️ Bills due in 5 days!" : "No urgent payments."}
                </p>
              </div>
            </Link>

            {/* Government Benefits Card */}
            <Link href="/government" className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-amber-200">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-brand-amber flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">
                  Government Benefits
                </h3>
                <p className="text-sm text-slate-500 mt-1">Pensions, Crop loans & Schemes.</p>
              </div>
            </Link>

            {/* Warranty & Expiry Card */}
            <Link href="/warranty" className="premium-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-blue-200">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center">
                  <CalendarClock className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 text-lg group-hover:text-brand-blue transition-colors">
                  Warranty & Expiry
                </h3>
                <p className="text-sm text-slate-500 mt-1">Track product warranty states.</p>
              </div>
            </Link>

          </div>
        </div>

        {/* AI Recommendations */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-brand-blue" />
            <h2 className="text-2xl font-heading font-bold text-slate-900">AI Priority Recommendations</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data.recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="premium-card p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${rec.priority.includes('High') ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-amber/10 text-brand-amber'}`}>{rec.priority}</span>
                {rec.type === 'Education' && <GraduationCap className="w-5 h-5 text-slate-400" />}
                {rec.type === 'Finance' && <Landmark className="w-5 h-5 text-slate-400" />}
                {rec.type === 'Health' && <HeartPulse className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="text-xl font-heading font-bold text-slate-900 mb-2">{rec.title}</h3>
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100 flex-1">
                <div className="mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Reason</span>
                  <p className="text-sm text-slate-700 font-medium">{rec.reason}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Benefit</span>
                  <p className="text-sm text-brand-green font-bold">{rec.benefit}</p>
                </div>
              </div>
              <Link href={`/chat?q=${encodeURIComponent(rec.query)}`} className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-brand-blue transition-colors flex items-center justify-center gap-2">
                {rec.action} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
