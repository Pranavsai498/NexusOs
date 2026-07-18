'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Heart, Pill, CalendarClock, ShieldAlert, 
  Plus, X, Loader2, Check, FileText, Landmark 
} from 'lucide-react';

export default function HealthPage() {
  const router = useRouter();
  const [insurances, setInsurances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [provider, setProvider] = useState('');
  const [policyName, setPolicyName] = useState('');
  const [premium, setPremium] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchInsurance(token);
  }, [router]);

  const fetchInsurance = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/finance/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter out records where type is Insurance
        const insList = data.filter((item: any) => item.record_type === 'Insurance');
        setInsurances(insList || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayPremium = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/finance/bills/${id}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Premium marked as Paid!');
        if (token) fetchInsurance(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !policyName || !premium || !dueDate) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/finance/bills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${provider} - ${policyName}`,
          amount: parseFloat(premium),
          category: 'Health',
          record_type: 'Insurance',
          due_date: dueDate,
          frequency: 'Monthly'
        })
      });
      if (res.ok) {
        alert('Insurance premium reminder registered successfully!');
        setShowAddModal(false);
        resetForm();
        if (token) fetchInsurance(token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setProvider('');
    setPolicyName('');
    setPremium('');
    setDueDate('');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-slate-700">Syncing Health details...</div>;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {['Dashboard', 'Planning', 'Family', 'Vault', 'Settings'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Health' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Activity className="w-10 h-10 text-rose-600" /> Family Health & Insurance
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Monitor medical records, prescriptions, and health/life insurance premiums.</p>
          </div>
          
          <button onClick={() => setShowAddModal(true)} className="btn-primary h-12 py-0 px-6 flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" /> Upload Insurance details
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Health & Life Insurance Details */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card p-6">
              <h2 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-rose-500" /> Insurance Premiums Reminders
              </h2>
              
              {insurances.length === 0 ? (
                <div className="text-center py-8 text-slate-500 font-medium">
                  No active health or life insurance records found. Add one to track premiums.
                </div>
              ) : (
                <div className="space-y-4">
                  {insurances.map((ins) => {
                    const isPaid = ins.status === 'Paid';
                    return (
                      <div key={ins.id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                        <div>
                          <h3 className="font-bold text-slate-900">{ins.title}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Premium: ₹{ins.amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <p className="text-xs font-semibold text-slate-500">Due: {ins.due_date}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${isPaid ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700 animate-pulse'}`}>
                              {ins.status}
                            </span>
                          </div>
                          {!isPaid && (
                            <button 
                              onClick={() => handlePayPremium(ins.id)}
                              className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition"
                            >
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Medical History */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="premium-card p-6">
              <h2 className="text-xl font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" /> Recent Medical History
              </h2>
              <div className="space-y-4">
                {[
                  { name: "Self (Owner)", event: "Annual Physical Exam", date: "Jul 12, 2026", status: "Healthy" },
                  { name: "Pranav (Son)", event: "Pediatric Dental Cleaning", date: "Jun 04, 2026", status: "No Cavities" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-white shadow-sm hover:shadow-md transition">
                    <div>
                      <h3 className="font-bold text-slate-900">{item.event}</h3>
                      <p className="text-sm text-slate-500 mt-1">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.date}</p>
                      <p className="text-xs text-brand-green font-bold mt-1">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Prescriptions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="premium-card p-6 border border-rose-100 bg-gradient-to-b from-rose-50/50">
              <h2 className="text-lg font-heading font-bold text-rose-900 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-rose-600" /> Active Prescriptions
              </h2>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-start gap-3 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Amoxicillin (500mg)</p>
                    <p className="text-xs text-slate-500 mt-1">Pranav • 2 Refills Remaining</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-100 flex items-start gap-3 shadow-sm">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Cetirizine (10mg)</p>
                    <p className="text-xs text-slate-500 mt-1">Self • Take daily at night</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Add Insurance Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Upload Policy Details</h3>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddInsurance} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Insurance Provider</label>
                  <input 
                    type="text" 
                    value={provider} 
                    onChange={(e) => setProvider(e.target.value)} 
                    required 
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                    placeholder="e.g. HDFC Ergo / LIC" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Policy Name / Number</label>
                  <input 
                    type="text" 
                    value={policyName} 
                    onChange={(e) => setPolicyName(e.target.value)} 
                    required 
                    className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                    placeholder="e.g. Health Suraksha (#99281X)" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Premium Amount (₹)</label>
                    <input 
                      type="number" 
                      value={premium} 
                      onChange={(e) => setPremium(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                      placeholder="0.00" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Premium Due Date</label>
                    <input 
                      type="date" 
                      value={dueDate} 
                      onChange={(e) => setDueDate(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
                  <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Reminders'}
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
