'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Scale, FileText, Briefcase } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold">N</div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">NexusAI</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8 items-center">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
              <Link href="/legal" className="border-blue-600 text-blue-600 px-1 pt-1 border-b-2 text-sm font-medium">Legal</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-slate-800" />
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Legal & Agreements</h1>
          </div>
          <p className="mt-2 text-lg text-gray-600">Secure storage for contracts, trusts, and legal advice.</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6 border-t-4 border-t-slate-800">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-slate-800" /> Active Contracts</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
                <h3 className="font-semibold text-gray-900">Home Mortgage Agreement</h3>
                <p className="text-sm text-gray-500">Signed: 2021-04-15</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
