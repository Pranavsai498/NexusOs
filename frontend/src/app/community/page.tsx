'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, ArrowLeft, Loader2, Sparkles, Check, AlertTriangle, 
  HelpCircle, Search, Play, HelpCircle as QuestionIcon, Plus, 
  ChevronRight, CheckCircle2, ShieldCheck, X, ShieldAlert
} from 'lucide-react';

const CATEGORIES = [
  'Savings & Finance', 'Education', 'Government Benefits', 
  'Health', 'Property & Vehicles', 'Local Insights (Hyderabad)'
];

import { Sidebar } from "@/components/navigation/Sidebar";

export default function CommunityPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active Category Insights filter
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // AI Trend Explorer QA Modal
  const [showQAModal, setShowQAModal] = useState(false);
  const [qaQuery, setQaQuery] = useState('');
  const [qaResult, setQaResult] = useState<any | null>(null);
  const [qaLoading, setQaLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCommunityData(token);
  }, [router]);

  const fetchCommunityData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/community/insights', {
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

  const handleAssistantQuery = async (queryType: string) => {
    setQaQuery(queryType);
    setShowQAModal(true);
    setQaLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/community/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: queryType })
      });
      if (res.ok) {
        const result = await res.json();
        setQaResult(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQaLoading(false);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Aggregating Community Trends...</p>
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
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Globe className="w-8 h-8 text-slate-800" /> Community Intelligence
            </h1>
            <p className="mt-1 text-slate-500 font-medium font-sans">
              Learn from millions of anonymous household trends, savings milestones, and local health maps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleAssistantQuery('saving')}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              <HelpCircle className="w-5 h-5 text-slate-500" /> How are families saving?
            </button>
            <button 
              onClick={() => handleAssistantQuery('scholarship')}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Scholarship Success
            </button>
          </div>
        </div>

        {/* Predictive Community Trends Warnings */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl mb-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-amber animate-pulse" /> Active Community Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.predictions.map((pred: string, idx: number) => (
              <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 leading-normal flex gap-2">
                <span className="w-1.5 h-1.5 bg-brand-amber rounded-full mt-1.5 shrink-0" />
                <span>{pred}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WOW: AI Family Benchmark Dashboard Dials */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm mb-10 space-y-6">
          <div>
            <h3 className="font-heading font-extrabold text-slate-900 text-lg">📊 AI Family Benchmark</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Understanding your household stats compared anonymously to regional parameters.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.benchmarks.map((b: any, idx: number) => (
              <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between h-40">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{b.metric}</span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mt-2 ${
                    b.color === 'green' ? 'bg-green-100 text-brand-green' : b.color === 'orange' ? 'bg-amber-100 text-brand-amber' : 'bg-red-150 text-brand-red'
                  }`}>
                    {b.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-normal mt-3">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Filters selection */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === null 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Insights
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Core Layout Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Insights Panel (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Anonymized Trends Deck</h2>
            
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-6 min-h-[300px]">
              {Object.entries(data.insights)
                .filter(([name]: any) => activeCategory ? name === activeCategory : true)
                .map(([name, bullets]: any) => (
                  <div key={name} className="space-y-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{name}</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {bullets.map((bullet: string, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2 text-xs font-semibold text-slate-700 leading-normal">
                          <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 shrink-0" />
                          <span>{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Privacy First visual explanation stepper (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Privacy Protection</h2>
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Privacy First Pipeline
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-1.5 leading-normal">
                  NexusOS anonymizes and pools household data dynamically. Absolute identities are never shared.
                </p>
              </div>

              <div className="relative border-l border-slate-200 pl-6 ml-3 space-y-4 text-[10px] font-bold text-slate-600">
                <div className="relative">
                  <span className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-900 rounded-full"></span>
                  <span>1. Family data locked in Vault</span>
                </div>
                <div className="relative">
                  <span className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-900 rounded-full"></span>
                  <span>2. Remove identities, PII & names</span>
                </div>
                <div className="relative">
                  <span className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-900 rounded-full"></span>
                  <span>3. Aggregate regional stats pools</span>
                </div>
                <div className="relative">
                  <span className="absolute left-[-29px] top-1 w-3 h-3 bg-slate-900 rounded-full"></span>
                  <span>4. Show anonymized recommendations</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* AI Assistant Dialog Modal */}
      <AnimatePresence>
        {showQAModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-950 flex items-center gap-2">
                  🧠 AI Community Guide
                </h3>
                <button onClick={() => setShowQAModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {qaLoading ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-500">Retrieving aggregated trend charts...</p>
                </div>
              ) : (
                qaResult && (
                  <div className="space-y-6">
                    <div className="bg-purple-500/10 border border-purple-250 p-5 rounded-2xl">
                      <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">
                        {qaResult.title}
                      </span>
                      <div className="space-y-3 mt-4 text-xs font-semibold text-slate-700">
                        {qaResult.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center border-b border-white/20 pb-2 last:border-0 last:pb-0">
                            <span>{item.name}</span>
                            <span className="text-brand-blue font-bold">{item.impact}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setShowQAModal(false);
                        router.push('/chat?q=Refinance home loan based on community tips');
                      }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md text-xs cursor-pointer"
                    >
                      Discuss with AI CFW Agent
                    </button>
                  </div>
                )
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
