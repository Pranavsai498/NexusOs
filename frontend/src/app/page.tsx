'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Play, ShieldCheck, Zap, Globe2, 
  BrainCircuit, Users, Activity, FileText, ChevronDown 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-bg relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-brand-blue/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-400/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>

      {/* Navigation */}
      <nav className="fixed w-full z-50 glass border-b-0 rounded-none rounded-b-[20px] top-0 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-[12px] flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg shadow-slate-900/20">
              N
            </div>
            <span className="text-2xl font-heading font-bold text-slate-900">NexusOS</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#agents" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Agents</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-900 hover:text-brand-blue transition-colors">Login</Link>
            <Link href="/register" className="hidden md:flex h-10 items-center justify-center rounded-full bg-brand-blue px-6 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-brand-green"></span>
            <span className="text-sm font-medium text-slate-600">NexusOS v2.0 is now live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-heading font-extrabold text-slate-900 tracking-tight leading-[1.1] max-w-5xl"
          >
            Your Family's <br />
            <span className="text-gradient">AI Operating System</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-xl md:text-2xl text-slate-600 max-w-3xl font-sans leading-relaxed"
          >
            One intelligent platform that manages education, finance, government services, healthcare, documents, planning, and daily life.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Link href="/register" className="btn-primary">
              Start Your Family Journey
            </Link>
            <button className="btn-secondary group">
              <Play className="w-5 h-5 mr-2 text-slate-900 group-hover:text-brand-blue transition-colors" />
              Watch Demo
            </button>
          </motion.div>

          {/* Floating Hero UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-24 w-full max-w-5xl aspect-video rounded-[30px] glass-dark p-2 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-[28px]"></div>
            
            {/* Mock Dashboard UI */}
            <div className="relative h-full w-full rounded-[24px] bg-slate-50 border border-slate-200/50 overflow-hidden flex flex-col">
              <div className="h-14 border-b border-slate-200 bg-white flex items-center px-6 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-brand-red/80"></div>
                  <div className="w-3 h-3 rounded-full bg-brand-amber/80"></div>
                  <div className="w-3 h-3 rounded-full bg-brand-green/80"></div>
                </div>
                <div className="text-sm font-heading font-semibold text-slate-800">Family Dashboard</div>
                <div className="w-8 h-8 rounded-full bg-brand-blue/10"></div>
              </div>
              <div className="flex-1 p-8 grid grid-cols-3 gap-6 bg-[#F8FAFC]">
                <div className="col-span-2 space-y-6">
                  <div className="h-40 premium-card p-6 flex flex-col justify-between">
                    <div className="w-1/3 h-4 rounded-full bg-slate-200"></div>
                    <div className="space-y-2">
                      <div className="w-full h-8 rounded-lg bg-slate-100"></div>
                      <div className="w-4/5 h-8 rounded-lg bg-slate-100"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="h-32 premium-card"></div>
                    <div className="h-32 premium-card"></div>
                  </div>
                </div>
                <div className="h-full premium-card p-6 space-y-4">
                  <div className="w-1/2 h-4 rounded-full bg-slate-200 mb-6"></div>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-12 rounded-xl bg-slate-100"></div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features / Benefits */}
        <section id="features" className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-slate-900 mb-6">
                Intelligence that feels like magic.
              </h2>
              <p className="text-xl text-slate-600">
                NexusOS replaces a dozen scattered apps with one unified, AI-driven experience for your entire household.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="premium-card p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6 group-hover:bg-brand-blue/20 transition-colors">
                  <BrainCircuit className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-slate-900 mb-4">11 Expert AI Agents</h3>
                <p className="text-slate-600 leading-relaxed">
                  From navigating complex government schemes to tracking medical records, specialized agents work 24/7 in the background for your family.
                </p>
              </div>

              <div className="premium-card p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-green/10 flex items-center justify-center mb-6 group-hover:bg-brand-green/20 transition-colors">
                  <ShieldCheck className="w-7 h-7 text-brand-green" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-slate-900 mb-4">Bank-Grade Security</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your family's most sensitive data—passports, tax returns, and health records—are encrypted and stored in a secure local vault.
                </p>
              </div>

              <div className="premium-card p-8 group">
                <div className="w-14 h-14 rounded-2xl bg-brand-amber/10 flex items-center justify-center mb-6 group-hover:bg-brand-amber/20 transition-colors">
                  <Activity className="w-7 h-7 text-brand-amber" />
                </div>
                <h3 className="text-2xl font-heading font-semibold text-slate-900 mb-4">Proactive Planning</h3>
                <p className="text-slate-600 leading-relaxed">
                  NexusOS doesn't wait for you to ask. It proactively notifies you about upcoming deadlines, loan refinancing opportunities, and expiring documents.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-5xl md:text-7xl font-heading font-bold text-slate-900 mb-8 tracking-tight">
              Ready to upgrade your family?
            </h2>
            <Link href="/register" className="btn-primary text-lg px-10 py-5">
              Launch NexusOS
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-heading font-bold text-xs">N</div>
            <span className="text-lg font-heading font-bold text-slate-900">NexusOS</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 Nexus AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
