'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, TrendingUp, PieChart, ArrowRight, Loader2, Plus, 
  Camera, Calendar, ShieldAlert, CreditCard, Check, X, AlertTriangle, FileText
} from 'lucide-react';

export default function FinancePage() {
  const router = useRouter();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBills(token);
  }, [router]);

  const fetchBills = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/finance/bills', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBills(data || []);
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
        if (token) fetchBills(token);
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
        alert('Bill added successfully!');
        setShowAddModal(false);
        resetForm();
        if (token) fetchBills(token);
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
      alert('Could not access camera for scanning bills.');
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
        canvas.toBlob(async (blob) => {
          if (blob) {
            const billFile = new File([blob], 'bill_snap.jpg', { type: 'image/jpeg' });
            stopCamera();
            await processOCR(billFile);
          }
        }, 'image/jpeg', 0.95);
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
    setShowAddModal(true); // Open form so users can see loading
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
        // Prefill form values with extracted OCR fields
        setTitle(data.title || '');
        setAmount(data.amount?.toString() || '');
        setDueDate(data.due_date || '');
        setCategory(data.category || 'Utilities');
        setRecordType(data.category === 'Utilities' ? 'Utilities' : 'EMI');
        alert('OCR text extracted and fields prefilled successfully! Please review and modify any values if necessary.');
      } else {
        alert('Could not parse bill automatically. Falling back to manual entry.');
      }
    } catch (e) {
      console.error(e);
      alert('OCR error. Defaulting to manual entry.');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Helper function to calculate remaining days
  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const due = new Date(dateStr);
    due.setHours(0,0,0,0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalEMI = bills.filter(b => b.record_type === 'EMI' && b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalLoan = bills.filter(b => b.record_type === 'Loan' && b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);
  const totalUtility = bills.filter(b => b.record_type === 'Utilities' && b.status !== 'Paid').reduce((sum, b) => sum + b.amount, 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-slate-700">Syncing Wealth details...</div>;

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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Finance' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
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
              <Wallet className="w-10 h-10 text-emerald-600" /> Family Wealth & Bills
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Manage family EMIs, crop loans, utility payments, and insurance premiums.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="btn-secondary h-12 py-0 px-6 flex items-center gap-2 border border-slate-200">
              <Camera className="w-5 h-5 text-slate-700" /> Scan Bill (OCR)
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary h-12 py-0 px-6 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Bill/EMI
            </button>
          </div>
        </div>

        {/* Financial Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="premium-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold uppercase text-xs">Total Utility Bills due</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalUtility.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">Broadband, Power, Water accounts</p>
          </div>

          <div className="premium-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="p-3 bg-amber-50 text-amber-600 rounded-xl font-bold uppercase text-xs">Total EMIs Outstanding</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalEMI.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">Home, Vehicle, and Devices loans</p>
          </div>

          <div className="premium-card p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-6">
              <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold uppercase text-xs">Crop Loans / Agriculture</span>
              <span className="text-2xl font-bold text-slate-900">₹{totalLoan.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">Government sponsored crop finance</p>
          </div>
        </div>

        {/* Bills & Payments Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-slate-700" />
            <h2 className="text-2xl font-heading font-bold text-slate-900">Outstanding Payments</h2>
          </div>

          {bills.length === 0 ? (
            <div className="premium-card p-12 text-center flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">No outstanding bills</h3>
              <p className="text-slate-500 mt-2">Add a bill manually or scan it to receive automated alerts and track payments.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {bills.map((bill) => {
                const daysLeft = getDaysRemaining(bill.due_date);
                const isUrgent = daysLeft <= 5 && daysLeft >= 0 && bill.status !== 'Paid';
                const isOverdue = daysLeft < 0 && bill.status !== 'Paid';

                return (
                  <motion.div 
                    key={bill.id} 
                    layout 
                    className={`premium-card p-6 flex flex-col justify-between border-l-4 ${isOverdue ? 'border-l-red-500' : isUrgent ? 'border-l-amber-500' : 'border-l-slate-200'}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">
                            {bill.record_type}
                          </span>
                          <h3 className="text-xl font-heading font-bold text-slate-900 mt-2">{bill.title}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-slate-950">₹{bill.amount.toLocaleString()}</span>
                          <p className="text-xs text-slate-400 font-semibold uppercase">{bill.frequency}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-slate-400" /> Due: {bill.due_date}</span>
                        {bill.status === 'Paid' ? (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold"><Check className="w-4 h-4" /> Paid</span>
                        ) : isOverdue ? (
                          <span className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold"><AlertTriangle className="w-4 h-4" /> Overdue</span>
                        ) : isUrgent ? (
                          <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse"><ShieldAlert className="w-4 h-4" /> Action Required (Due in {daysLeft} days)</span>
                        ) : (
                          <span className="text-slate-500">({daysLeft} days remaining)</span>
                        )}
                      </div>
                    </div>

                    {bill.status !== 'Paid' && (
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={() => handlePayBill(bill.id)}
                          className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-all flex items-center gap-2"
                        >
                          Mark as Paid
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

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
                    <label className="block text-sm font-medium text-slate-600 mb-1">Upload Receipt for Auto-Fill</label>
                    <input type="file" accept="image/*" onChange={handleFileUploadScan} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Bill / Merchant Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" placeholder="e.g. Electricity Bill" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Amount (₹)</label>
                      <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Due Date</label>
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Type</label>
                      <select value={recordType} onChange={(e) => { setRecordType(e.target.value); setCategory(e.target.value); }} className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold text-slate-800">
                        <option value="Utilities">Utilities</option>
                        <option value="EMI">EMI</option>
                        <option value="Loan">Crop Loan</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Frequency</label>
                      <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold text-slate-800">
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                        <option value="One-time">One-time</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
                    <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-850 transition-all flex items-center justify-center">
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
                <div className="absolute inset-4 border-2 border-white/40 border-dashed rounded-xl pointer-events-none"></div>
              </div>

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button onClick={stopCamera} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600">Close</button>
                <button onClick={captureAndScan} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg">
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
