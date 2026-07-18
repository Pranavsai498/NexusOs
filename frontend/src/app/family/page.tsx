'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, ShieldCheck, ShieldAlert, Award, Calendar, HeartPulse, 
  Sparkles, Check, X, ArrowLeft, ArrowRight, Activity, Landmark, Scale,
  BookOpen, FileText, ChevronRight, AlertTriangle, Play, HelpCircle, Loader2
} from 'lucide-react';

import { Sidebar } from "@/components/navigation/Sidebar";

export default function FamilyProfilePage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile View
  const [selectedMember, setSelectedMember] = useState<any | null>(null); // null = Home Roster
  const [activeTab, setActiveTab] = useState('goals'); // goals, calendar, timeline, twin

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTwinDrawer, setShowTwinDrawer] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Add Member Forms
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Spouse');
  const [age, setAge] = useState('');

  // Twin Simulator State
  const [twinScenario, setTwinScenario] = useState('job'); // job, baby, house
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchFamilyData(token);
  }, [router]);

  const fetchFamilyData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/family/insights', {
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

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !age) {
      alert('Please fill out all fields.');
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, relation, age: parseInt(age) })
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setAge('');
        if (token) fetchFamilyData(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const runTwinSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1200);
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Syncing Family portfolios...</p>
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
              👥 My Family
            </h1>
            <p className="mt-2 text-slate-500 font-medium font-sans">
              Manage family member roles, permission access gates, shared calendars, and AI Digital Twins.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowEmergencyModal(true)}
              className="bg-red-50 text-red-600 border border-red-200 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-100 shadow-sm transition-colors text-sm"
            >
              🚨 Family Emergency
            </button>
            <button 
              onClick={() => setShowTwinDrawer(true)}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              <Sparkles className="w-5 h-5 text-brand-blue animate-pulse" /> AI Family Digital Twin
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <UserPlus className="w-5 h-5" /> Add Member
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* VIEW 1: Family Home Screen Roster */}
          {!selectedMember && (
            <motion.div 
              key="roster-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              {/* Overall Family Status Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  { title: "Health", val: data.summary.health, color: "text-rose-500", icon: "❤️" },
                  { title: "Finance", val: data.summary.finance, color: "text-emerald-500", icon: "💰" },
                  { title: "Education", val: data.summary.education, color: "text-purple-500", icon: "🎓" },
                  { title: "Government", val: data.summary.government, color: "text-blue-500", icon: "🏛️" },
                  { title: "Legal Status", val: data.summary.legal, color: "text-slate-800", icon: "⚖️" }
                ].map((item) => (
                  <div key={item.title} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{item.title}</span>
                    <div className="text-base font-black text-slate-900 mt-2 flex items-center gap-1.5">
                      <span>{item.icon}</span>
                      <span className={item.val.includes('No') || item.val.includes('Excel') || item.val.includes('Good') ? 'text-emerald-600' : 'text-brand-blue'}>
                        {item.val}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Family Tree Graphic Card */}
              {data.members.length > 1 && (
                <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">AI Family Tree Diagram</h3>
                  <div className="flex flex-col items-center gap-8 py-4">
                    {/* Grandfather / Parents (Parent relation in database) */}
                    {data.members.filter((m: any) => m.relation === 'Parent').map((m: any, idx: number) => (
                      <div key={idx} className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 shadow-sm">
                        👴 {m.name} (Parent)
                      </div>
                    ))}
                    
                    {/* Connector */}
                    {data.members.some((m: any) => m.relation === 'Parent') && (
                      <div className="w-0.5 h-6 bg-slate-200"></div>
                    )}

                    {/* Active User and Spouse */}
                    <div className="flex flex-wrap gap-6 items-center justify-center">
                      <div className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-md">
                        👨 {data.members.find((m: any) => m.id === 'self' || m.relation === 'Owner' || m.relation === 'Self')?.name || 'User'} (Self)
                      </div>
                      {data.members.filter((m: any) => m.relation === 'Spouse').map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-6">
                          <span className="text-slate-350 font-extrabold">🤝</span>
                          <div className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-md">
                            👩 {m.name} (Spouse)
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Connector */}
                    {data.members.some((m: any) => m.relation === 'Child') && (
                      <div className="w-0.5 h-6 bg-slate-200"></div>
                    )}

                    {/* Children */}
                    <div className="flex flex-wrap gap-4 justify-center">
                      {data.members.filter((m: any) => m.relation === 'Child').map((m: any, idx: number) => (
                        <div key={idx} className="px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 shadow-sm">
                          👧 {m.name} (Child)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Members List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.members.map((member: any) => (
                  <motion.div
                    key={member.id || member._id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedMember(member)}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer flex flex-col justify-between h-56 hover:border-slate-300 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <img src={member.avatar} alt={member.name} className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 shrink-0" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'Active' ? 'bg-green-100 text-brand-green' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-extrabold text-slate-900 text-lg mt-4">{member.name}</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Role: {member.role} • Age: {member.age}</p>
                      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between text-[10px] uppercase font-bold text-slate-400">
                        <span>Access: {member.permissions}</span>
                        <span className="text-brand-blue group-hover:translate-x-1 transition-transform">Profile →</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Roster detail tabs: Calendar, timeline, etc. */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
                
                {/* 1. Goals Grid (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Family Shared Goals</h3>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                    {data.goals.map((g: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span>{g.name}</span>
                          <span>{g.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-slate-900 h-full rounded-full" style={{ width: `${g.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Shared Calendar (4 Cols) */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Today's Family Calendar</h3>
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                    {data.calendar.map((cal: any, idx: number) => (
                      <div key={idx} className="py-3.5 flex justify-between items-center gap-3 first:pt-0 last:pb-0 text-xs font-semibold">
                        <div>
                          <h4 className="text-slate-800 font-extrabold leading-tight">{cal.title}</h4>
                          <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">{cal.type}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[9px] whitespace-nowrap">
                          {cal.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* VIEW 2: Selected Family Member Detail Profiles */}
          {selectedMember && (
            <motion.div 
              key="member-detail"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Family Hub</span>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">
                    {selectedMember.name} • {selectedMember.role}
                  </h2>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm max-w-2xl space-y-6">
                <div className="flex items-center gap-6 border-b border-slate-100 pb-6">
                  <img src={selectedMember.avatar} alt={selectedMember.name} className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100" />
                  <div>
                    <h3 className="text-2xl font-black font-heading text-slate-950">{selectedMember.name}</h3>
                    <p className="text-sm font-semibold text-slate-400 mt-1">Relation Status: {selectedMember.relation} • Age: {selectedMember.age}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-semibold text-slate-500">
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Access Controls</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Permissions Roster</span>
                      <p className="text-slate-900 font-extrabold mt-1 text-sm">{selectedMember.permissions}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Associated Milestones</span>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <div className="flex justify-between"><span>Health Tracker</span><span className="text-brand-green font-bold">🟢 Active</span></div>
                      <div className="flex justify-between"><span>Government Radar</span><span className="text-brand-blue font-bold">✓ Matches Sync</span></div>
                      <div className="flex justify-between"><span>Digital Vault Locker</span><span className="text-slate-700 font-bold">✓ Connected</span></div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <Link 
                    href={`/chat?q=Show me ${selectedMember.name}'s document folders`}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-md transition-colors flex items-center gap-1"
                  >
                    View Vault Assets <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* WOW: AI Family Digital Twin Simulation Slide Drawer */}
      <AnimatePresence>
        {showTwinDrawer && (
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
                    <Sparkles className="w-6 h-6 text-brand-blue animate-pulse" />
                    <h3 className="text-2xl font-black font-heading text-slate-950">AI Family Digital Twin</h3>
                  </div>
                  <button onClick={() => setShowTwinDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Scenario Selector */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Simulate Life Event Scenario</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'job', name: 'Sarah\'s Job' },
                      { id: 'baby', name: 'New Baby' },
                      { id: 'house', name: 'Buy House' }
                    ].map((sc) => (
                      <button
                        key={sc.id}
                        onClick={() => {
                          setTwinScenario(sc.id);
                          runTwinSimulation();
                        }}
                        className={`py-2 px-3 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                          twinScenario === sc.id 
                            ? 'bg-slate-900 text-white shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {isSimulating ? (
                  <div className="py-16 text-center space-y-3">
                    <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto" />
                    <h4 className="font-bold text-slate-800">Recalculating Family Pillars...</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">Evaluating financial models, insurance rules, and tax thresholds.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Simulated Consequences</span>
                      
                      {twinScenario === 'job' && (
                        <div className="mt-4 space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Finance</span><span className="text-slate-900 font-bold">Creates dynamic salary track logs & savings budgets</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Government</span><span className="text-slate-900 font-bold">Initiates income tax filing checks & declarations</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Digital Vault</span><span className="text-slate-900 font-bold">Secures scanned copy of first placement offer letter</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Planning</span><span className="text-slate-900 font-bold">Sets up independent personal savings milestones</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Family Hub</span><span className="text-slate-900 font-bold">Adjusts family monthly income aggregation tallies</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Life Brain</span><span className="text-slate-900 font-bold">Generates career transition guidelines checklist</span></div>
                        </div>
                      )}

                      {twinScenario === 'baby' && (
                        <div className="mt-4 space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Family Roster</span><span className="text-slate-900 font-bold">✓ Baby Profile Created</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Health</span><span className="text-slate-900 font-bold">✓ Vaccination Timeline & schedules drafted</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Government</span><span className="text-slate-900 font-bold">✓ Birth Certificate checklist generated</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Finance</span><span className="text-slate-900 font-bold">✓ Child education savings goal & Cover</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Locker Vault</span><span className="text-slate-900 font-bold">✓ New medical files folders structured</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Family Calendar</span><span className="text-slate-900 font-bold">✓ Pediatrician checkup schedules synchronized</span></div>
                        </div>
                      )}

                      {twinScenario === 'house' && (
                        <div className="mt-4 space-y-4 text-xs font-semibold text-slate-600 leading-relaxed">
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Legal Center</span><span className="text-slate-900 font-bold">✓ Sale Deed folders & Property Tax trackers added</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Finance</span><span className="text-slate-900 font-bold">✓ Home Loan EMI recharges scheduled</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Locker Vault</span><span className="text-slate-900 font-bold">✓ Possession certs & survey map folders registered</span></div>
                          <div className="flex justify-between border-b border-slate-100 pb-2"><span>Utility Planning</span><span className="text-slate-900 font-bold">✓ Electricity NOC & Water tax checklist structured</span></div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowTwinDrawer(false);
                    router.push('/chat?q=Configure my family Twin rules');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  Configure Digital Twin Roadmap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚨 Family Emergency Bypass Modal Overlay */}
      <AnimatePresence>
        {showEmergencyModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 text-white max-w-xl w-full p-8 rounded-[32px] shadow-2xl border border-red-500/30 overflow-y-auto max-h-[90vh] relative"
            >
              <div className="absolute right-[-10%] top-[-10%] w-[12rem] h-[12rem] bg-red-500/10 rounded-full filter blur-[50px] pointer-events-none"></div>

              <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-7 h-7 text-red-500 animate-ping" />
                  <h3 className="text-2xl font-black font-heading text-white">🚨 Family Emergency Passport</h3>
                </div>
                <button onClick={() => setShowEmergencyModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-xs font-semibold text-slate-300">
                
                {/* Contacts & Hospital */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">Emergency Contacts</span>
                    <p className="text-white font-extrabold mt-1.5 leading-snug">
                      Lakshmi (Spouse) • +91 98765 43211<br />
                      Ramesh Kumar (Owner) • +91 98765 43210
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">Nearest Cashless Hospitals</span>
                    <p className="text-white font-extrabold mt-1.5 leading-snug">
                      Apollo Hospitals (Secunderabad)<br />
                      Care Hospitals (Banjara Hills)
                    </p>
                  </div>
                </div>

                {/* Insurances */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">Health Insurance coverage</span>
                  <div className="flex justify-between text-white font-extrabold mt-1.5">
                    <span>HDFC Ergo Optima Secure</span>
                    <span>Policy ID: ERGO-4492812</span>
                    <span>Cover: ₹10,00,000</span>
                  </div>
                </div>

                {/* Vital Specs per member */}
                <div className="space-y-3">
                  <span className="text-[10px] text-red-400 uppercase tracking-wider block font-bold">Vitals & Active Meds Check</span>
                  <div className="divide-y divide-white/5">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-white font-bold">Ramesh Kumar (Self)</span>
                      <span>Blood Group: O+ • Allergies: None</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-white font-bold">Venkat Kumar (Father)</span>
                      <span>Blood Group: B+ • Allergies: Penicillin • Meds: Metformin, Amlodipine</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-white font-bold">Sarah Kumar (Daughter)</span>
                      <span>Blood Group: O+ • Allergies: Dust/Pollen</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setShowEmergencyModal(false)}
                  className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs shadow-md transition-colors cursor-pointer"
                >
                  Close Bypass Screen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add family member Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-sm w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Add Family Portfolio</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    required
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Lakshman Kumar"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Relation</label>
                    <select 
                      value={relation} 
                      onChange={e => setRelation(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                    <input 
                      type="number" 
                      value={age} 
                      required
                      onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 68"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center text-sm cursor-pointer shadow-md"
                  >
                    Save Portfolio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
