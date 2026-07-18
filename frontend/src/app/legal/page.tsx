'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scale, FileText, Briefcase, Plus, X, ArrowLeft, ArrowRight, Check, AlertTriangle, 
  MapPin, Landmark, Calendar, ShieldCheck, HelpCircle, Sparkles, Loader2, Info
} from 'lucide-react';

export default function LegalPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation
  const [activeTab, setActiveTab] = useState('property'); // property, vehicles, rental, traffic, complaint, family, timeline

  // Modals & form state
  const [showAddPropModal, setShowAddPropModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [propName, setPropName] = useState('');
  const [propLoc, setPropLoc] = useState('');

  // Consumer Complaint Assistant Wizard
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardBrand, setWizardBrand] = useState('LG');
  const [wizardDate, setWizardDate] = useState('2025-06-15');
  const [wizardInvoice, setWizardInvoice] = useState('Yes');
  const [wizardWarranty, setWizardWarranty] = useState('Yes');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchLegalData(token);
  }, [router]);

  const fetchLegalData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/legal/insights', {
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

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propName || !propLoc) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/legal/property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: propName, location: propLoc })
      });
      if (res.ok) {
        alert('Property details registered! Securing matching folders.');
        setShowAddPropModal(false);
        setPropName('');
        setPropLoc('');
        if (token) fetchLegalData(token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Validating Family Legal Deeds...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900 font-sans">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
            { name: 'Vault', path: '/vault', icon: '📂' },
            { name: 'Planning', path: '/planning', icon: '🗓️' },
            { name: 'Family', path: '/family', icon: '👥' },
            { name: 'Settings', path: '/settings', icon: '⚙️' }
          ].map((item) => (
            <Link 
              key={item.name} 
              href={item.path} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                item.name === 'Dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:block font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              ⚖️ Legal Center
            </h1>
            <p className="mt-2 text-slate-500 font-medium font-sans">
              Manage family lease renewals, property deeds, challans, and consumer complaints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setWizardStep(1);
                setActiveTab('complaint');
              }}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              🛒 Consumer Complaint Assistant
            </button>
            <button 
              onClick={() => setShowAddPropModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Add Property
            </button>
          </div>
        </div>

        {/* Predictive Alert Banners */}
        <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl mb-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-brand-amber animate-pulse" /> Active Legal Reminders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.predictions.map((pred: string, idx: number) => (
              <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl text-xs font-bold text-slate-700 leading-normal flex gap-2">
                <span className="w-1.5 h-1.5 bg-brand-amber rounded-full mt-1.5 shrink-0" />
                <span>{pred}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Bar navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin">
          {[
            { id: 'property', name: 'Property Management', icon: '🏠' },
            { id: 'vehicles', name: 'Vehicles Center', icon: '🚗' },
            { id: 'rental', name: 'Rental Agreements', icon: '📑' },
            { id: 'traffic', name: 'Traffic & Challans', icon: '🚨' },
            { id: 'complaint', name: 'Consumer Assistant', icon: '🛒' },
            { id: 'family', name: 'Family Deeds Checklist', icon: '👥' },
            { id: 'timeline', name: 'Legal History Timeline', icon: '📅' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === 'complaint') setWizardStep(1);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab content widgets display */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <AnimatePresence mode="wait">
            
            {/* 1. Property Management Tab */}
            {activeTab === 'property' && (
              <motion.div 
                key="tab-property"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-heading font-extrabold text-slate-900 text-lg">Ramesh Family House</h3>
                  <span className="text-xs font-semibold text-slate-400">Hyderabad (TS)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(data.property_docs).map(([name, isPresent]: any) => (
                    <div 
                      key={name}
                      className={`flex justify-between items-center p-4 rounded-2xl border text-xs font-bold ${
                        isPresent ? 'bg-emerald-50/20 border-emerald-100 text-slate-800' : 'bg-red-50/20 border-red-100 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isPresent ? (
                          <Check className="w-4 h-4 text-brand-green" />
                        ) : (
                          <X className="w-4 h-4 text-brand-red" />
                        )}
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isPresent ? 'Verified' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 2. Vehicles Center Tab */}
            {activeTab === 'vehicles' && (
              <motion.div 
                key="tab-vehicles"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {data.vehicles.map((v: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-heading font-extrabold text-slate-900 text-lg">{v.name}</h4>
                        <span className="text-xs font-bold text-slate-400 uppercase">{v.number}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">
                        {v.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(v.documents).map(([name, isPresent]: any) => (
                        <div 
                          key={name}
                          className={`flex justify-between items-center p-4 rounded-2xl border text-xs font-bold ${
                            isPresent ? 'bg-emerald-50/20 border-emerald-100 text-slate-800' : 'bg-rose-50 border-rose-100 text-slate-500'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {isPresent ? (
                              <Check className="w-4 h-4 text-brand-green" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-brand-red animate-pulse" />
                            )}
                            {name}
                          </span>
                          {!isPresent && (
                            <Link href="/vault" className="py-1 px-3 bg-slate-900 text-white text-[10px] rounded-lg hover:bg-brand-blue transition-colors">
                              Upload PUC
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* 3. Rental Agreements Tab */}
            {activeTab === 'rental' && (
              <motion.div 
                key="tab-rental"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 font-semibold text-xs text-slate-500">
                  <div className="flex justify-between"><span>Tenant</span><span className="text-slate-800 font-bold">{data.rental.tenant}</span></div>
                  <div className="flex justify-between"><span>Landlord</span><span className="text-slate-800 font-bold">{data.rental.landlord}</span></div>
                  <div className="flex justify-between"><span>Monthly Rent</span><span className="text-slate-900 font-extrabold">₹{data.rental.monthly_rent.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Security Deposit</span><span className="text-slate-800 font-bold">₹{data.rental.deposit.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Start Date</span><span>{data.rental.start_date}</span></div>
                  <div className="flex justify-between"><span>End Date</span><span>{data.rental.end_date}</span></div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex flex-col justify-between h-48">
                  <div>
                    <h4 className="font-extrabold text-amber-900 text-sm">Lease Expiry approaching</h4>
                    <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                      Your lease agreement expires in {data.rental.expiry_days_left} days (31 December). 
                      Would you like NexusOS to draft a lease renewal agreement using default state formats?
                    </p>
                  </div>
                  <button 
                    onClick={() => router.push('/chat?q=Draft a rental agreement renewal')}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Draft Renewal Deed
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. Traffic & Challans Tab */}
            {activeTab === 'traffic' && (
              <motion.div 
                key="tab-traffic"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Driving Licence</span>
                    <span className="text-base text-slate-800 font-extrabold block mt-2">Expires in {data.traffic.dl_days_left} Days</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">PUC Certificate</span>
                    <span className="text-base text-rose-500 font-extrabold block mt-2 animate-pulse">Expires in {data.traffic.puc_days_left} Days</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center">
                    <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Pending Challans</span>
                    <span className="text-base text-rose-500 font-extrabold block mt-2 animate-pulse">{data.traffic.pending_challans.length} Challan</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Outstanding Challans</span>
                  {data.traffic.pending_challans.map((ch: any, idx: number) => (
                    <div key={idx} className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-rose-950 text-sm">{ch.violation}</h4>
                        <span className="text-[10px] text-slate-400 block mt-1">Challan: {ch.challan_number} • Date: {ch.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-rose-900 text-sm">₹{ch.amount.toLocaleString()}</span>
                        <button 
                          onClick={() => alert(`Redirecting to Challan portal for ${ch.challan_number}`)}
                          className="py-1.5 px-4 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-colors"
                        >
                          Pay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. Consumer Complaint Assistant Tab (Wizard) */}
            {activeTab === 'complaint' && (
              <motion.div 
                key="tab-complaint"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-xl mx-auto space-y-6"
              >
                <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                  <h3 className="font-heading font-extrabold text-slate-900 text-lg">Consumer Dispute Guide</h3>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                    Step {wizardStep} of 2
                  </span>
                </div>

                {wizardStep === 1 && (
                  <div className="space-y-4 text-xs font-semibold text-slate-500">
                    <div>
                      <label className="block text-slate-400 uppercase tracking-widest mb-1.5">Product Category / Brand</label>
                      <select 
                        value={wizardBrand} 
                        onChange={e => setWizardBrand(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      >
                        <option value="LG Refrigerator">LG Refrigerator</option>
                        <option value="Samsung Mobile">Samsung Mobile</option>
                        <option value="Whirlpool Refrigerator">Whirlpool Refrigerator</option>
                        <option value="Sony Television">Sony Television</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 uppercase tracking-widest mb-1.5">Purchase Date</label>
                        <input 
                          type="date" 
                          value={wizardDate} 
                          onChange={e => setWizardDate(e.target.value)}
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 uppercase tracking-widest mb-1.5">Invoice Memo Available?</label>
                        <select 
                          value={wizardInvoice} 
                          onChange={e => setWizardInvoice(e.target.value)}
                          className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 uppercase tracking-widest mb-1.5">Warranty currently Active?</label>
                      <select 
                        value={wizardWarranty} 
                        onChange={e => setWizardWarranty(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => setWizardStep(2)}
                      className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Generate Complaint Package <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="bg-purple-500/10 border border-purple-250 p-5 rounded-2xl">
                      <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">Assistance Package: {wizardBrand}</span>
                      <div className="text-slate-700 text-xs leading-relaxed space-y-3 mt-3 font-medium">
                        <p>📋 **Checklist**: File grievance under National Consumer Helpline (NCH) portal.</p>
                        <p>📄 **Required papers**: Purchase Invoice (Status: {wizardInvoice}), Warranty Card (Status: {wizardWarranty}), service rejection email logs.</p>
                        <p>💼 **Next Steps**: Draft formal legal warning notice to service team head.</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setWizardStep(1);
                        router.push('/chat?q=Draft consumer complaint for ' + wizardBrand);
                      }}
                      className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md text-xs cursor-pointer"
                    >
                      Discuss Draft with Legal Agent
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 6. Family Deeds Checklist Tab */}
            {activeTab === 'family' && (
              <motion.div 
                key="tab-family"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(data.family).map(([name, isPresent]: any) => (
                    <div 
                      key={name}
                      className={`flex justify-between items-center p-4 rounded-2xl border text-xs font-bold ${
                        isPresent ? 'bg-emerald-50/20 border-emerald-100 text-slate-800' : 'bg-red-50/20 border-red-100 text-slate-500'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isPresent ? (
                          <Check className="w-4 h-4 text-brand-green" />
                        ) : (
                          <X className="w-4 h-4 text-brand-red" />
                        )}
                        {name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {isPresent ? 'Verified' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 7. Legal Timeline Tab */}
            {activeTab === 'timeline' && (
              <motion.div 
                key="tab-timeline"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Family Legal History timeline</h3>
                <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-6">
                  {data.timeline.map((step: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute left-[-31px] top-1.5 w-4 h-4 bg-slate-900 rounded-full ring-4 ring-slate-100"></span>
                      <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-700">{step.event} ({step.details})</span>
                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{step.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Add Property Modal */}
      <AnimatePresence>
        {showAddPropModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-sm w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Add Property Profile</h3>
                <button onClick={() => setShowAddPropModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-455">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddProperty} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Property Name</label>
                  <input 
                    type="text" 
                    value={propName} 
                    required
                    onChange={e => setPropName(e.target.value)}
                    placeholder="e.g. Ramesh Family House"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Location</label>
                  <input 
                    type="text" 
                    value={propLoc} 
                    required
                    onChange={e => setPropLoc(e.target.value)}
                    placeholder="e.g. Hyderabad (TS)"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowAddPropModal(false)} 
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center text-sm cursor-pointer shadow-md"
                  >
                    Save Property
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
