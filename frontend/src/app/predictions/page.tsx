'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, ArrowLeft, Loader2, Sparkles, Check, AlertTriangle, 
  Clock, ShieldAlert, Award, Landmark, Activity, GraduationCap, 
  MapPin, HelpCircle, FileText, ChevronRight, Play, Info, Calendar, X
} from 'lucide-react';

const CATEGORIES = ['Finance', 'Health', 'Government', 'Education', 'Legal', 'Assets', 'Family', 'Planning'];
import { Sidebar } from "@/components/navigation/Sidebar";

export default function PredictionsPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Future Simulator State
  const [showSimDrawer, setShowSimDrawer] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('house'); // house, job, abroad, retire, sip
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Prediction Assistant QA
  const [showQAModal, setShowQAModal] = useState(false);
  const [qaQuery, setQaQuery] = useState('');
  const [qaResult, setQaResult] = useState<any | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPredictionsData(token);
  }, [router]);

  const fetchPredictionsData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/predictive/insights', {
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

  const handleSimulate = async (scenario: string) => {
    setSelectedScenario(scenario);
    setIsSimulating(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/predictive/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scenario })
      });
      if (res.ok) {
        const result = await res.json();
        setSimulationResult(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const runAssistantQA = (queryType: string) => {
    setQaQuery(queryType);
    setShowQAModal(true);

    if (queryType === 'prepare') {
      setQaResult({
        title: "Next 90 Days Readiness Roadmap",
        items: [
          "🗓️ Renew HDFC Ergo Health Policy Cover (Due in 15 Days)",
          "🏛️ Verify Sarah's Pragati Scholarship credentials",
          "🚗 Splendor Bike PUC Checkup (Due in 5 Days)",
          "🩺 Parents Annual Preventive Checkup (Suggested this month)",
          "⚖️ Rental Lease Renewal deed (Due in 45 Days)"
        ]
      });
    } else {
      setQaResult({
        title: "Savings Adequacy Tally (Next Year)",
        summary: "Yes. Current projections indicate healthy reserves.",
        items: [
          "💵 Projected Total Income: ₹14,40,000",
          "📈 Estimated Savings: ₹3,80,000",
          "🛡️ Emergency Fund Buffer: Healthy (8 Months coverage)",
          "💡 Suggested Action: Maintain ₹3,500 monthly mutual SIP"
        ]
      });
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Running Predictive Forecasts...</p>
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
              🔮 Prediction Center
            </h1>
            <p className="mt-1 text-slate-500 font-medium font-sans">
              AI Forecast Radar projecting financial, health, government, and legal timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => runAssistantQA('prepare')}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              <HelpCircle className="w-5 h-5 text-slate-500" /> What to prepare for?
            </button>
            <button 
              onClick={() => {
                setShowSimDrawer(true);
                handleSimulate('house');
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Launch Future Simulator
            </button>
          </div>
        </div>

        {/* Prediction Metrics Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">⚠️ Active Risks</span>
            <div className="text-3xl font-black text-rose-500 mt-2">{data.summary.risks_count} Risks</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🟢 Opportunities Match</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">{data.summary.opportunities_count} Available</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">📈 Tracked Trends</span>
            <div className="text-3xl font-black text-brand-blue mt-2">{data.summary.trends_count} Logged</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">⭐ AI Confidence Gauge</span>
            <div className="text-3xl font-black text-slate-950 mt-2">{data.summary.confidence}% Match</div>
          </div>
        </div>

        {/* AI Opportunity Feed Slider */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl mb-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" /> Today's AI Opportunity feed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {data.opportunities.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium py-2 col-span-4">No active opportunities detected. Add records to identify potential matches.</p>
            ) : (
              data.opportunities.map((opp: any, idx: number) => (
                <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 leading-normal">
                  <span className="text-slate-900 block font-extrabold mb-1">{opp.title}</span>
                  <span className="text-slate-500 font-semibold">{opp.desc}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category selection filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === null 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Forecasts
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

        {/* Main Content Grid layouts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 1. Forecast list deck (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tracked Category Predictions</h2>
            
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-6 min-h-[300px]">
              {Object.entries(data.categories).every(([_, bullets]: any) => bullets.length === 0) ? (
                <p className="text-sm text-slate-500 font-medium py-2">No category forecasts registered yet.</p>
              ) : (
                Object.entries(data.categories)
                  .filter(([name]: any) => activeCategory ? name === activeCategory : true)
                  .map(([name, bullets]: any) => bullets.length > 0 && (
                    <div key={name} className="space-y-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{name} Forecast</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bullets.map((bullet: string, idx: number) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-2 text-xs font-semibold text-slate-700 leading-relaxed">
                            <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 shrink-0" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* 2. Timeline and Risks panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Risk Dashboard */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Risk Radar levels</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                {data.risks.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium py-2">No active risks cataloged.</p>
                ) : (
                  data.risks.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs font-bold">
                      <div>
                        <h4 className="text-slate-800 font-extrabold">{r.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5 block">{r.category}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                        r.level.includes('High') ? 'bg-red-150 text-brand-red' : r.level.includes('Medium') ? 'bg-amber-100 text-brand-amber' : r.level.includes('Low') ? 'bg-green-100 text-brand-green' : 'bg-blue-100 text-brand-blue'
                      }`}>
                        {r.level}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Predictive Timeline Nodes</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                {data.timeline.length === 0 ? (
                  <p className="text-xs text-slate-500 font-medium py-2">No timeline targets synced.</p>
                ) : (
                  data.timeline.map((node: any, idx: number) => (
                    <div key={idx} className="py-3.5 flex justify-between items-center gap-3 first:pt-0 last:pb-0 text-xs font-semibold">
                      <div>
                        <h4 className="text-slate-800 font-extrabold leading-tight">{node.task}</h4>
                        <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">Timeline Target</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[9px] whitespace-nowrap">
                        {node.period}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FLAGSHIP FEATURE: AI Future Simulator Sandboxed Drawer */}
      <AnimatePresence>
        {showSimDrawer && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-md h-full shadow-2xl p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-8">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-brand-blue animate-pulse" />
                    <h3 className="text-2xl font-black font-heading text-slate-950">Future Simulator</h3>
                  </div>
                  <button onClick={() => setShowSimDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scenario buttons */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Choose "What If" Scenario</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'house', name: 'Buy a House' },
                      { id: 'job', name: 'Lose Job' },
                      { id: 'abroad', name: 'Study Abroad' },
                      { id: 'retire', name: 'Retire at 58' },
                      { id: 'sip', name: 'Increase SIP' }
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => handleSimulate(sc.id)}
                        className={`py-2.5 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                          selectedScenario === sc.id 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consequences result panels */}
                {isSimulating ? (
                  <div className="py-20 text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto" />
                    <h4 className="font-bold text-slate-800">Recalculating Family Forecasts...</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Evaluating dynamic impacts across health, finance, education, and legal registries.</p>
                  </div>
                ) : (
                  simulationResult && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulated Pillar Impacts</span>
                        <div className="mt-4 space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
                          {Object.entries(simulationResult.impacts).map(([pillar, val]: any) => (
                            <div key={pillar} className="flex justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                              <span className="text-slate-900 font-black shrink-0 w-24">{pillar}</span>
                              <span className="text-slate-700 text-right">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowSimDrawer(false);
                    router.push('/chat?q=Configure my future simulator limits');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  Configure Simulation parameters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Assistant QA Dialog Modal */}
      <AnimatePresence>
        {showQAModal && qaResult && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-950 flex items-center gap-2">
                  🧠 AI Prediction Guide
                </h3>
                <button onClick={() => setShowQAModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-purple-500/10 border border-purple-250 p-5 rounded-2xl">
                  <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">
                    {qaResult.title}
                  </span>
                  {qaResult.summary && (
                    <p className="text-xs text-slate-900 font-extrabold mt-2 leading-snug">{qaResult.summary}</p>
                  )}
                  <div className="space-y-2 mt-4 text-xs font-semibold text-slate-700">
                    {qaResult.items.map((item: string, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Check className="w-4 h-4 text-brand-green shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowQAModal(false);
                    router.push('/chat?q=Show my upcoming 90 days legal & tax timelines');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md text-xs cursor-pointer"
                >
                  Discuss with AI Planner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
