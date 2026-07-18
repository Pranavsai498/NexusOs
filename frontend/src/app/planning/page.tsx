'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, Calendar, ChevronRight, Download, Link as LinkIcon, HelpCircle
} from 'lucide-react';

export default function PlanningPage() {
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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Planning' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* AI Summary Banner */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-6 rounded-[24px] bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Sparkles className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold mb-2">We analyzed your family and created the best action plan.</h2>
              <p className="text-slate-300 max-w-3xl leading-relaxed">
                Based on your current financial health, Sarah's upcoming college admission, and pending government schemes, our AI agents have orchestrated the following structured timeline to maximize your benefits and minimize risk.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Timeline & Planner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Education Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-slate-900">Education & Scholarships</h3>
              </div>
              <div className="premium-card p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">PM Engineering Scholarship</h4>
                    <p className="text-slate-500 text-sm mt-1">For Sarah Ramesh • B.Tech Computer Science</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-heading font-bold text-brand-green">₹50,000</span>
                    <span className="block text-xs text-slate-400 font-semibold uppercase mt-1">Benefit Amount</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Eligibility</span>
                    <p className="font-medium text-slate-700 mt-1">Income &lt; 8LPA, Grade &gt; 85%</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase">Deadline</span>
                    <p className="font-medium text-brand-red mt-1">October 15, 2026</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/chat?q=I+want+to+apply+for+the+PM+Engineering+Scholarship+now" className="flex-1 btn-primary py-3 text-sm flex items-center justify-center">Apply Automatically</Link>
                  <Link href="/chat?q=Why+is+the+PM+Engineering+Scholarship+recommended?" className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full font-medium hover:bg-slate-50 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Why this?
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Financial Plan Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-slate-900">Financial Restructuring</h3>
              </div>
              <div className="premium-card p-6">
                <div className="flex items-start justify-between border-b border-slate-100 pb-6 mb-6">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Home Loan Refinancing</h4>
                    <p className="text-slate-500 text-sm mt-1">Current Bank: HDFC • ROI: 8.9%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-heading font-bold text-brand-blue">8.4%</span>
                    <span className="block text-xs text-slate-400 font-semibold uppercase mt-1">New Target ROI</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link href="/chat?q=Help+me+start+the+Home+Loan+Refinancing+process" className="flex-1 btn-primary py-3 text-sm bg-brand-blue hover:bg-blue-700 flex items-center justify-center">Start Refinance Process</Link>
                  <Link href="/chat?q=Why+is+Home+Loan+Refinancing+recommended?" className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-full font-medium hover:bg-slate-50 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" /> Why this?
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Timeline Sidebar */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
            <h3 className="text-xl font-heading font-bold text-slate-900 mb-4">Upcoming Timeline</h3>
            <div className="premium-card p-6">
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                
                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-brand-red/20 flex items-center justify-center border-4 border-white">
                    <div className="w-2 h-2 rounded-full bg-brand-red"></div>
                  </div>
                  <div className="pl-6">
                    <span className="text-xs font-bold text-brand-red uppercase tracking-wider">Oct 15, 2026</span>
                    <h5 className="font-bold text-slate-900 mt-1">Scholarship Application</h5>
                    <p className="text-sm text-slate-500 mt-1">Upload pending 10th marksheet to complete.</p>
                    <button className="mt-3 text-xs font-semibold text-brand-blue flex items-center gap-1 hover:underline">
                      <Calendar className="w-3 h-3" /> Add to Calendar
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-brand-amber/20 flex items-center justify-center border-4 border-white">
                    <div className="w-2 h-2 rounded-full bg-brand-amber"></div>
                  </div>
                  <div className="pl-6">
                    <span className="text-xs font-bold text-brand-amber uppercase tracking-wider">Nov 01, 2026</span>
                    <h5 className="font-bold text-slate-900 mt-1">Insurance Premium</h5>
                    <p className="text-sm text-slate-500 mt-1">Health insurance renewal for the family.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute -left-[37px] top-1 w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white">
                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  </div>
                  <div className="pl-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dec 12, 2026</span>
                    <h5 className="font-bold text-slate-900 mt-1">Passport Renewal</h5>
                    <p className="text-sm text-slate-500 mt-1">John's passport expires in 6 months.</p>
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
