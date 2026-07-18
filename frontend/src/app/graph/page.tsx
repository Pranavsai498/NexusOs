'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, ArrowLeft, Loader2, Sparkles, Check, AlertTriangle, 
  HelpCircle, Search, Play, HelpCircle as QuestionIcon, Plus, 
  ChevronRight, CheckCircle2, ShieldCheck, X, FileText, Activity
} from 'lucide-react';
import { Sidebar } from "@/components/navigation/Sidebar";

export default function GraphPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Active Subtree visualizer
  const [activeSubtree, setActiveSubtree] = useState('house'); // house, education, health, bike

  // Semantic Search State
  const [searchQuery, setSearchQuery] = useState('Show everything related to our house');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Cross Pillar Impact Simulator State
  const [activeEvent, setActiveEvent] = useState<string | null>(null); // job_loss, buy_car

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchGraphData(token);
    handleSearchSubmit(new Event('submit') as any, token);
  }, [router]);

  const fetchGraphData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/graph/insights', {
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

  const handleSearchSubmit = async (e: React.FormEvent, customToken?: string) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    const token = customToken || localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/graph/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: searchQuery })
      });
      if (res.ok) {
        const results = await res.json();
        setSearchResults(results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Loading Family Brain Network...</p>
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
              <Network className="w-8 h-8 text-slate-800" /> Knowledge Graph
            </h1>
            <p className="mt-1 text-slate-500 font-medium font-sans">
              Interconnected mapping links between family members, assets, document files, and legal responsibilities.
            </p>
          </div>
        </div>

        {/* Graph Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">👨 Family Members</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.members_count} Connections</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">📄 Documents</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.documents_count} Connected</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🏠 Assets</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.assets_count} Connected</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">🔗 Relationships</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">{data.summary.relationships_count} Active</div>
          </div>
        </div>

        {/* Interactive Relationship Map Selector */}
        <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm mb-10 space-y-6">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-heading font-extrabold text-slate-900 text-lg flex items-center gap-2">
                🗺️ AI Family Relationship Map
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-1">Tap a category to explore how everything is connected.</p>
            </div>
            
            <div className="flex gap-2">
              {[
                { id: 'house', name: 'Ramesh House 🏠' },
                { id: 'education', name: 'Sarah\'s Education 🎓' },
                { id: 'health', name: 'Sita\'s Health ❤️' },
                { id: 'bike', name: 'Splendor Bike 🚗' }
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubtree(sub.id)}
                  className={`py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeSubtree === sub.id 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive relationship node layouts */}
          <div className="bg-slate-950 text-white rounded-[24px] p-8 min-h-[250px] relative overflow-hidden flex flex-col justify-center items-center gap-6">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <AnimatePresence mode="wait">
              {activeSubtree === 'house' && (
                <motion.div 
                  key="tree-house"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap gap-4 justify-center items-center text-xs font-bold font-sans"
                >
                  <div className="px-4 py-2 bg-blue-500 rounded-xl">👨 Ramesh Kumar</div>
                  <span className="text-slate-500">▶ (owns) ▶</span>
                  <div className="px-4 py-2 bg-indigo-500 rounded-xl">🏠 Ramesh House</div>
                  <span className="text-slate-500">▶ (financed by) ▶</span>
                  <div className="px-4 py-2 bg-emerald-500 rounded-xl">💳 SBI Home Loan</div>
                  <span className="text-slate-500">▶ (requires) ▶</span>
                  <div className="px-4 py-2 bg-rose-500 rounded-xl">📉 Monthly EMI</div>
                  <div className="w-full flex justify-center mt-2 gap-4">
                    <span className="px-3 py-1 bg-white/10 rounded-lg">📄 Sale Deed</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">⚡ Electricity NOC</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">🛡️ Property Insurance</span>
                  </div>
                </motion.div>
              )}

              {activeSubtree === 'education' && (
                <motion.div 
                  key="tree-education"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap gap-4 justify-center items-center text-xs font-bold font-sans"
                >
                  <div className="px-4 py-2 bg-blue-500 rounded-xl">👧 Sarah Kumar</div>
                  <span className="text-slate-500">▶ (attends) ▶</span>
                  <div className="px-4 py-2 bg-purple-500 rounded-xl">🎓 Engineering College</div>
                  <span className="text-slate-500">▶ (submits) ▶</span>
                  <div className="px-4 py-2 bg-indigo-500 rounded-xl">🏛️ Pragati Scholarship</div>
                  <span className="text-slate-500">▶ (requires) ▶</span>
                  <div className="px-4 py-2 bg-emerald-500 rounded-xl">📄 Income Certificate</div>
                  <div className="w-full flex justify-center mt-2 gap-4">
                    <span className="px-3 py-1 bg-white/10 rounded-lg">📋 CGPA: 8.2</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">📄 Resume Draft</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">💼 Campus Placement</span>
                  </div>
                </motion.div>
              )}

              {activeSubtree === 'health' && (
                <motion.div 
                  key="tree-health"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap gap-4 justify-center items-center text-xs font-bold font-sans"
                >
                  <div className="px-4 py-2 bg-blue-500 rounded-xl">👩 Sita Kumar</div>
                  <span className="text-slate-500">▶ (insured by) ▶</span>
                  <div className="px-4 py-2 bg-rose-500 rounded-xl">🩺 HDFC Health Cover</div>
                  <span className="text-slate-500">▶ (consults) ▶</span>
                  <div className="px-4 py-2 bg-purple-500 rounded-xl">🏥 Cardiologist</div>
                  <span className="text-slate-500">▶ (prescribed) ▶</span>
                  <div className="px-4 py-2 bg-emerald-500 rounded-xl">💊 Metformin meds</div>
                  <div className="w-full flex justify-center mt-2 gap-4">
                    <span className="px-3 py-1 bg-white/10 rounded-lg">📅 Doctor Appointments</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">🔬 Lab Reports</span>
                  </div>
                </motion.div>
              )}

              {activeSubtree === 'bike' && (
                <motion.div 
                  key="tree-bike"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-wrap gap-4 justify-center items-center text-xs font-bold font-sans"
                >
                  <div className="px-4 py-2 bg-blue-500 rounded-xl">👨 Ramesh Kumar</div>
                  <span className="text-slate-500">▶ (owns) ▶</span>
                  <div className="px-4 py-2 bg-indigo-500 rounded-xl">🚗 Splendor Bike</div>
                  <span className="text-slate-500">▶ (secured by) ▶</span>
                  <div className="px-4 py-2 bg-emerald-500 rounded-xl">📄 HDFC Vehicle Cover</div>
                  <div className="w-full flex justify-center mt-2 gap-4">
                    <span className="px-3 py-1 bg-white/10 rounded-lg">✓ Registration RC</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">❌ PUC Expired (Renew)</span>
                    <span className="px-3 py-1 bg-white/10 rounded-lg">⚙️ Service History logs</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Semantic Search AI Reasoning panel & Impact Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* AI Semantic Search reasoning panel (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">AI Semantic Explorer Search</h2>
            
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm space-y-6">
              <form onSubmit={handleSearchSubmit} className="flex gap-3">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Show everything related to our house"
                  className="flex-1 h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                />
                <button 
                  type="submit" 
                  disabled={searchLoading}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Ask Graph</span>
                </button>
              </form>

              {searchResults && (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-[10px] text-brand-blue font-bold uppercase tracking-wider block">AI Reasoning Narrative</span>
                    <p className="text-slate-800 text-xs font-extrabold mt-1">{searchResults.reasoning}</p>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Relationship mapping results</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.results.map((res: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                          <span>{res.entity}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{res.relationship}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cross Pillar Impact simulator (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-sans">Cross-Pillar simulator</h2>
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulate job loss incident</span>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">Simulating key life shocks triggers propagation path alerts instantly across all modules.</p>
              
              <button 
                onClick={() => {
                  setActiveEvent(activeEvent === 'job_loss' ? null : 'job_loss');
                }}
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{activeEvent === 'job_loss' ? 'Clear Simulation' : 'Simulate job loss'}</span>
                <Play className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {activeEvent === 'job_loss' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 border-t border-slate-100 pt-3 text-[10px] font-bold text-slate-600 leading-normal"
                  >
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span>Finance</span><span className="text-slate-800">Depletion alarm (8 Months cover)</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span>Government</span><span className="text-slate-800">Checks unemployment benefits</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span>Locker Vault</span><span className="text-slate-800">Lock severance copies</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span>Planning</span><span className="text-slate-800">Freeze leisure subscriptions</span></div>
                    <div className="flex justify-between border-b border-slate-50 pb-1.5"><span>Predictions</span><span className="text-slate-800">Flag High Risk indicators</span></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
