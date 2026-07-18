'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertOctagon, PhoneCall, Shield, FileWarning } from 'lucide-react';

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-red-50">
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg shadow-md flex items-center justify-center text-white font-bold">N</div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">NexusAI</span>
            </div>
            <div className="hidden sm:flex sm:space-x-8 items-center">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:text-gray-700 px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
              <Link href="/emergency" className="border-red-600 text-red-600 px-1 pt-1 border-b-2 text-sm font-medium">Emergency</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-red-100 rounded-full mb-4">
            <AlertOctagon className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-red-900 tracking-tight">Emergency Break-Glass Folder</h1>
          <p className="mt-4 text-lg text-red-700 max-w-2xl mx-auto">Critical information for your family in case of emergency. Accessible offline and highly encrypted.</p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
            <Shield className="w-8 h-8 text-red-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Legal Directives</h2>
            <p className="text-gray-600 text-sm mb-4">Living Wills, Power of Attorney, and Trusts.</p>
            <button className="text-red-600 font-bold hover:underline">Unlock Documents</button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
            <FileWarning className="w-8 h-8 text-red-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Insurance Policies</h2>
            <p className="text-gray-600 text-sm mb-4">Life Insurance, Health Insurance, and Home Policies.</p>
            <button className="text-red-600 font-bold hover:underline">Unlock Documents</button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-white rounded-2xl p-6 shadow-sm border border-red-200">
            <PhoneCall className="w-8 h-8 text-red-600 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Important Contacts</h2>
            <p className="text-gray-600 text-sm mb-4">Lawyer, primary care physician, and extended family.</p>
            <button className="text-red-600 font-bold hover:underline">View Contacts</button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
