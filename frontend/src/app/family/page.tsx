'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserPlus, ShieldCheck, GraduationCap, Briefcase, 
  HeartPulse, Sparkles, AlertCircle
} from 'lucide-react';

export default function FamilyProfilePage() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch('http://localhost:8000/api/v1/family', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        // Map backend data to UI format or fallback
        if (response.ok && data && data.length > 0) {
          const formatted = data.map((member: any) => ({
            role: member.relation,
            name: member.name,
            occupation: 'Not specified',
            income: 'N/A',
            health: member.age > 60 ? 'Needs Checkup Alert' : 'Healthy',
            education: member.age < 22 ? 'Student' : 'Graduated',
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${member.name.split(' ')[0]}`
          }));
          setFamilyMembers(formatted);
        } else {
          // Fallback initial state if empty
          setFamilyMembers([]);
        }
      } catch (error) {
        console.error("Failed to fetch family members:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, []);


  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar (Minimal) */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {['Dashboard', 'Planning', 'Family', 'Vault', 'Settings'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Family' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Family Profile</h1>
            <p className="mt-2 text-slate-500 font-medium">Manage individual profiles to improve AI recommendations.</p>
          </div>
          <Link href="/chat?q=I+want+to+add+a+new+family+member+profile" className="btn-primary text-sm px-6 py-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Member
          </Link>
        </div>

        {/* AI Explainability Banner */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-5 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 flex gap-4 items-start">
          <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue"><Sparkles className="w-5 h-5" /></div>
          <div>
            <h3 className="font-bold text-brand-blue">Why add more information?</h3>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Adding details like Grandparents' medical history or Children's specific interests allows the AI to automatically discover senior citizen healthcare schemes and niche educational scholarships you might otherwise miss.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Members Grid */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-2 text-center text-slate-500 py-10">Loading family data from backend...</div>
            ) : familyMembers.length === 0 ? (
              <div className="col-span-2 text-center text-slate-500 py-10">No family members found. Add someone to get started!</div>
            ) : (
              familyMembers.map((member, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="premium-card p-6 flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200" />
                    <div>
                      <h3 className="font-heading font-bold text-xl text-slate-900">{member.name}</h3>
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-md uppercase tracking-wider">{member.role}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Briefcase className="w-4 h-4" /> Occupation</span>
                    <span className="font-medium text-slate-900">{member.occupation}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><HeartPulse className="w-4 h-4" /> Health</span>
                    <span className={`font-medium ${member.health.includes('Alert') ? 'text-brand-amber' : 'text-brand-green'}`}>{member.health}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><GraduationCap className="w-4 h-4" /> Education</span>
                    <span className="font-medium text-slate-900">{member.education}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-brand-green/20 border-2 border-white flex items-center justify-center text-brand-green"><ShieldCheck className="w-4 h-4" /></div>
                    <div className="w-8 h-8 rounded-full bg-brand-blue/20 border-2 border-white flex items-center justify-center text-brand-blue"><AlertCircle className="w-4 h-4" /></div>
                  </div>
                  <Link href={`/chat?q=I+want+to+edit+${member.name.split(' ')[0]}'s+profile`} className="text-sm font-semibold text-brand-blue hover:underline">Edit Profile</Link>
                </div>
              </motion.div>
            )))}
          </div>

          {/* Family Insights Panel */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="premium-card p-6 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-brand-blue/30 rounded-full blur-[60px]"></div>
              
              <h3 className="text-xl font-heading font-bold mb-8 relative z-10">Global Insights</h3>
              
              <div className="space-y-8 relative z-10">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-300">Financial Health</span>
                    <span className="text-brand-green">Strong</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-green w-[85%] rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-300">Govt Benefits Match</span>
                    <span className="text-brand-amber">Action Needed</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-amber w-[40%] rounded-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-300">Retirement Readiness</span>
                    <span className="text-white">On Track</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue w-[75%] rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
