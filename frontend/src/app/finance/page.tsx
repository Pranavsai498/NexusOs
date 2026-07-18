'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, ArrowRight, Loader2, Plus, 
  Camera, Calendar, ShieldAlert, CreditCard, Check, X, AlertTriangle, 
  FileText, Sparkles, Percent, HeartPulse, ShieldCheck, HelpCircle, Info
} from 'lucide-react';

const CATEGORY_TABS = [
  { id: 'bills', name: 'Bills', icon: '💳' },
  { id: 'loans', name: 'Loans', icon: '🏦' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'credit', name: 'Credit Cards', icon: '💳' },
  { id: 'recharge', name: 'Recharge', icon: '📱' },
  { id: 'budget', name: 'Budget', icon: '💰' },
  { id: 'taxes', name: 'Taxes', icon: '💸' },
  { id: 'savings', name: 'Savings & Health', icon: '📊' }
];

export default function FinancePage() {
  const router = useRouter();
  const [cfoData, setCfoData] = useState<any>(null);
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bills');

  // Coach drawer state
  const [showCoachDrawer, setShowCoachDrawer] = useState(false);

  // Modals & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Utilities');
  const [recordType, setRecordType] = useState('Utilities'); // Utilities, EMI, Loan, Insurance
  const [frequency, setFrequency] = useState('Monthly');

  // Camera Crop simulator progress
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchCFOData(token);
  }, [router]);

  const fetchCFOData = async (token: string) => {
    try {
      const [resCfo, resBills] = await Promise.all([
        fetch('http://localhost:8000/api/v1/finance/cfo-insights', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/v1/finance/bills', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      if (resCfo.ok) {
        const data = await resCfo.json();
        setCfoData(data);
      }
      if (resBills.ok) {
        const billsList = await resBills.json();
        setBills(billsList || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/finance/bills/${id}/pay`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Bill marked as Paid!');
        if (token) fetchCFOData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate) {
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
          title,
          amount: parseFloat(amount),
          category,
          record_type: recordType,
          due_date: dueDate,
          frequency
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        if (token) fetchCFOData(token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setDueDate('');
    setCategory('Utilities');
    setRecordType('Utilities');
    setFrequency('Monthly');
  };

  const startCamera = async () => {
    try {
      setShowCameraModal(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      alert('Could not access camera.');
      setShowCameraModal(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setShowCameraModal(false);
  };

  const captureAndScan = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        setIsScanning(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setScanProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                const billFile = new File([blob], 'bill_snap.jpg', { type: 'image/jpeg' });
                stopCamera();
                await processOCR(billFile);
              }
            }, 'image/jpeg', 0.95);
          }
        }, 200);
      }
    }
  };

  const handleFileUploadScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processOCR(e.target.files[0]);
    }
  };

  const processOCR = async (fileToScan: File) => {
    setIsOCRProcessing(true);
    setShowAddModal(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileToScan);
    formData.append('doc_type', 'bill');

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setTitle(data.title || '');
        setAmount(data.amount?.toString() || '');
        setDueDate(data.due_date || '');
        setCategory(data.category || 'Utilities');
        setRecordType(data.category === 'Utilities' ? 'Utilities' : 'EMI');
      } else {
        alert('Could not parse bill automatically.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Smart reminder helper matching 5 stages
  const getReminderStage = (daysLeft: number) => {
    if (daysLeft < 0) return { label: 'Overdue', color: 'bg-red-100 text-brand-red border-red-200 shadow-red-100' };
    if (daysLeft === 0) return { label: 'Due Today', color: 'bg-red-50 text-red-600 border-red-150 animate-pulse' };
    if (daysLeft === 1) return { label: 'Due Tomorrow', color: 'bg-amber-100 text-brand-amber border-amber-200' };
    if (daysLeft <= 5) return { label: `Due in ${daysLeft} days`, color: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { label: `Due in ${daysLeft} days`, color: 'bg-slate-100 text-slate-500' };
  };

  if (loading || !cfoData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Syncing Wealth databases...</p>
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
                item.name === 'Finance' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="hidden md:block font-medium">{item.name}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Body */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              💰 Family Finance CFO
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Manage family EMIs, crop loans, utility payments, and insurance premiums.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all text-sm">
              <Camera className="w-5 h-5" /> Scan Bill (OCR)
            </button>
            <button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-all text-sm">
              <Plus className="w-5 h-5" /> Add Bill/EMI
            </button>
          </div>
        </div>

        {/* 1. CFO Summary Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
          
          {/* This Month Cash Flow */}
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-[24px] p-6 shadow-xl col-span-1 lg:col-span-2 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute right-[-10%] top-[-10%] w-[12rem] h-[12rem] bg-brand-blue/20 rounded-full filter blur-[50px] pointer-events-none"></div>
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">This Month Summary</span>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Income</span>
                  <span className="text-2xl font-extrabold text-white mt-1 block">₹{cfoData.summary.income.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Expenses</span>
                  <span className="text-2xl font-extrabold text-red-400 mt-1 block">₹{cfoData.summary.expense.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Savings</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">₹{cfoData.summary.savings.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4 mt-6 flex justify-between items-center">
              <div className="flex gap-3">
                <span className="text-xs font-bold text-red-400">🔴 {cfoData.summary.bills_due_count} Bills Due</span>
                <span className="text-xs font-bold text-amber-400">🟠 {cfoData.summary.insurance_due_count} Insurance</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Active CFO monitoring</span>
            </div>
          </div>

          {/* AI Coach Banner */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Estimated Total Savings</span>
              <div className="text-3xl font-black text-emerald-600 mt-1 font-sans">
                ₹{cfoData.summary.estimated_savings.toLocaleString()}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-normal font-semibold">Identified through loan refinancing and community utility audit.</p>
            </div>
            <button 
              onClick={() => setShowCoachDrawer(true)}
              className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-brand-blue hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" /> AI Savings Coach <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Health Score Gauge */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Financial Health</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{cfoData.health_score.score}/100</div>
              </div>
              <span className="px-2.5 py-0.5 text-xs font-extrabold bg-emerald-50 text-brand-green border border-emerald-100 rounded-full uppercase">
                {cfoData.health_score.status}
              </span>
            </div>
            
            <div className="space-y-1 mt-4">
              {cfoData.health_score.checklist.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">{item.name}</span>
                  <span className={item.status ? 'text-brand-green' : 'text-brand-amber font-extrabold'}>
                    {item.status ? '✓ Healthy' : 'Needs Update'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 2. Category Tab bar navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
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

        {/* 3. Category Tab Manager Panes */}
        <div className="space-y-8">
          <AnimatePresence mode="wait">
            
            {/* TAB: BILLS */}
            {activeTab === 'bills' && (
              <motion.div 
                key="tab-bills"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bills.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center col-span-2">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 font-bold">No outstanding utilities found in database.</p>
                    </div>
                  ) : (
                    bills.map((bill) => {
                      const daysLeft = getDaysRemaining(bill.due_date);
                      const rem = getReminderStage(daysLeft);
                      return (
                        <div key={bill.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-extrabold uppercase">
                                {bill.record_type}
                              </span>
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-xl border ${rem.color}`}>
                                {bill.status === 'Paid' ? '✓ Paid' : rem.label}
                              </span>
                            </div>
                            <h3 className="font-heading font-extrabold text-slate-900 text-lg mt-3">{bill.title}</h3>
                            <div className="flex gap-4 items-center text-xs font-semibold text-slate-400 mt-2">
                              <span>Due: {bill.due_date}</span>
                              <span>•</span>
                              <span>Category: {bill.category}</span>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center">
                            <span className="text-xl font-black text-slate-900">₹{bill.amount.toLocaleString()}</span>
                            {bill.status !== 'Paid' && (
                              <button 
                                onClick={() => handlePayBill(bill.id)}
                                className="py-1.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-inner cursor-pointer"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: LOANS */}
            {activeTab === 'loans' && (
              <motion.div 
                key="tab-loans"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* AI Loan Advisor Refinancing Tip */}
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 rounded-3xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-brand-blue flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">You can reduce your EMI by ₹2,350/month</h4>
                    <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                      Bank of Baroda is currently offering home loan rates at 7.8% interest compared to your current 8.4% with SBI. 
                      Would you like me to coordinate documents from the Vault and submit a refinancing request?
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cfoData.loans.map((loan: any, idx: number) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-bold">🏛️</span>
                        {loan.refinance_opportunity && (
                          <span className="px-2 py-0.5 bg-blue-100 text-brand-blue text-[10px] font-bold rounded-full uppercase">Refinance Match</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-heading font-extrabold text-slate-900 text-lg">{loan.name}</h4>
                        <p className="text-xs text-slate-400 font-semibold">{loan.provider}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs font-semibold text-slate-500">
                        <div className="flex justify-between"><span>Loan Amount</span><span className="text-slate-800 font-bold">₹{loan.amount.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Remaining Balance</span><span className="text-slate-800 font-bold">₹{loan.balance.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Interest Rate</span><span className="text-slate-800 font-bold">{loan.interest}%</span></div>
                        <div className="flex justify-between"><span>Monthly EMI</span><span className="text-slate-900 font-black">₹{loan.emi.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Completion Date</span><span>{loan.completion}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB: INSURANCE */}
            {activeTab === 'insurance' && (
              <motion.div 
                key="tab-insurance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {cfoData.insurance.map((ins: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">🛡️</span>
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 rounded-full">{ins.type} Insurance</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-slate-900 text-lg mt-4">{ins.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">Policy: {ins.policy_number}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-6 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                      <div>
                        <span>Coverage</span>
                        <p className="text-slate-800 font-bold mt-0.5">₹{ins.coverage.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>Annual Premium</span>
                        <p className="text-slate-800 font-bold mt-0.5">₹{ins.premium.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>Nominee</span>
                        <p className="text-slate-800 font-bold mt-0.5">{ins.nominee}</p>
                      </div>
                      <div>
                        <span>Next Renewal</span>
                        <p className="text-brand-amber font-bold mt-0.5">{ins.renewal}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB: CREDIT CARDS */}
            {activeTab === 'credit' && (
              <motion.div 
                key="tab-credit"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {cfoData.credit_cards.map((cc: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-2xl">💳</span>
                        <span className="text-xs font-bold text-slate-400">Rewards: {cc.reward_points} pts</span>
                      </div>
                      <h4 className="font-heading font-extrabold text-slate-900 text-lg mt-4">{cc.name}</h4>
                    </div>

                    <div className="border-t border-slate-100 pt-4 mt-6 grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                      <div>
                        <span>Outstanding Balance</span>
                        <p className="text-slate-950 font-black mt-0.5">₹{cc.outstanding.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>Minimum Due</span>
                        <p className="text-slate-800 font-bold mt-0.5">₹{cc.min_due.toLocaleString()}</p>
                      </div>
                      <div>
                        <span>Payment Due Date</span>
                        <p className="text-red-500 font-bold mt-0.5">{cc.due_date}</p>
                      </div>
                      <div>
                        <span>AI Suggestion</span>
                        <p className="text-brand-blue font-bold mt-0.5 leading-tight">{cc.best_option}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB: RECHARGES */}
            {activeTab === 'recharge' && (
              <motion.div 
                key="tab-recharge"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {cfoData.recharges.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="text-2xl">📱</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold rounded">Active</span>
                    </div>
                    <h4 className="font-heading font-extrabold text-slate-900 text-base mt-4">{rec.name}</h4>
                    
                    <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-900">₹{rec.amount.toLocaleString()}</span>
                      <span className={rec.expires_in_days && rec.expires_in_days <= 1 ? 'text-brand-red animate-pulse' : 'text-brand-blue'}>
                        {rec.expires_in_days ? `Expires in ${rec.expires_in_days} days` : `Renews ${rec.renewal_date}`}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB: BUDGET */}
            {activeTab === 'budget' && (
              <motion.div 
                key="tab-budget"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {/* AI Spending Alert */}
                <div className="bg-amber-500/10 border border-amber-250 rounded-3xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-brand-amber flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Monthly Spending Alert</h4>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{cfoData.budget_analysis}</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Budget Enforcements</h3>
                  <div className="space-y-4">
                    {cfoData.budgets.map((bud: any, idx: number) => {
                      const ratio = Math.min(100, (bud.spent / bud.limit) * 100);
                      return (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-800">{bud.category}</span>
                            <span className="text-slate-500">₹{bud.spent.toLocaleString()} / ₹{bud.limit.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${bud.status === 'Over Limit' ? 'bg-brand-red' : 'bg-brand-blue'}`} style={{ width: `${ratio}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: TAXES */}
            {activeTab === 'taxes' && (
              <motion.div 
                key="tab-taxes"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-250 rounded-3xl p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-brand-green flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">Possible Tax Saving: ₹{cfoData.tax_intelligence.possible_tax_saving.toLocaleString()}</h4>
                    <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                      We cross-referenced your profile with documents inside the Vault. Based on your family context, you can claim tax deductions using these suggestions.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Deductions Audit Checklist</h3>
                  <div className="divide-y divide-slate-100">
                    {cfoData.tax_intelligence.recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0 text-sm font-bold text-slate-700">
                        <Check className="w-5 h-5 text-brand-green shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: SAVINGS */}
            {activeTab === 'savings' && (
              <motion.div 
                key="tab-savings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-8"
              >
                {/* 1. Proactive Predictive Alerts */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Predictive Alerts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {cfoData.predictions.map((pred: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            pred.type === 'warning' ? 'bg-brand-red animate-ping' : pred.type === 'upcoming' ? 'bg-brand-blue' : 'bg-brand-amber'
                          }`} />
                          <span className="text-[9px] uppercase font-bold text-slate-400">{pred.type}</span>
                        </div>
                        <h4 className="font-heading font-extrabold text-slate-900 text-sm">{pred.title}</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{pred.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Community Intelligence comparisons */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Community Intelligence</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="bg-indigo-500/5 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
                      <span className="text-2xl">🏘️</span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Home Loan Refinancing</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Families similar to your demographic saved an average of **₹12,000** annually by migrating loans.
                        </p>
                      </div>
                    </div>

                    <div className="bg-indigo-500/5 border border-indigo-100 rounded-3xl p-6 flex items-start gap-4">
                      <span className="text-2xl">📶</span>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Local Broadband Benchmarking</h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Average broadband bill in your neighborhood is **₹799/month**. You currently pay **₹1,099/month**. 
                          Estimated loss: ₹300/month.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* AI Savings Coach Sliding Drawer */}
      <AnimatePresence>
        {showCoachDrawer && (
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
                    <h3 className="text-2xl font-black font-heading text-slate-950">AI Savings Coach</h3>
                  </div>
                  <button onClick={() => setShowCoachDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-250 p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest block">Total Estimated Benefit</span>
                  <div className="text-4xl font-extrabold text-brand-green mt-1">₹{cfoData.savings_coach.total_annual_benefit.toLocaleString()}/yr</div>
                </div>

                <div className="space-y-6">
                  {cfoData.savings_coach.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                        %
                      </div>
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded whitespace-nowrap">Save {item.savings}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-normal">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowCoachDrawer(false);
                    router.push('/chat?q=Apply for LP Gas subsidy');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  Configure Savings Plan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Bill Modal */}
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Add Bill Details</h3>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {isOCRProcessing ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                  <p className="font-semibold text-slate-700">Gemini AI is analyzing receipt text...</p>
                  <p className="text-xs text-slate-400 mt-2">Extracting title, amount, and due date</p>
                </div>
              ) : (
                <form onSubmit={handleAddBill} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Upload Receipt for Auto-Fill</label>
                    <input type="file" accept="image/*,application/pdf" onChange={handleFileUploadScan} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bill / Merchant Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm" placeholder="e.g. Electricity Bill" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Amount (₹)</label>
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                      <select value={recordType} onChange={(e) => { setRecordType(e.target.value); setCategory(e.target.value); }} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm">
                        <option value="Utilities">Utilities</option>
                        <option value="EMI">EMI</option>
                        <option value="Loan">Crop Loan</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Frequency</label>
                      <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full h-11 px-4 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm">
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm">Cancel</button>
                    <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center text-sm cursor-pointer shadow-md">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Bill'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCameraModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-[24px] max-w-xl w-full p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Scan Bill / Receipt</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-slate-100 mb-8 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                
                {/* simulated crop guidance line */}
                <div className="absolute inset-6 border-2 border-white/50 border-dashed rounded-xl pointer-events-none">
                  {isScanning && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-brand-blue shadow-[0_0_8px_#3b82f6]"
                    />
                  )}
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider block">AI Processing Receipt...</span>
                    <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-blue h-full" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button onClick={stopCamera} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm">Close</button>
                <button onClick={captureAndScan} disabled={isScanning} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm cursor-pointer">
                  <Camera className="w-5 h-5" /> Snap Photo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
