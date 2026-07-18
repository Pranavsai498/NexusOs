'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarClock, Search, Plus, Camera, Trash2, X, Loader2, Check, AlertTriangle, HelpCircle, FileText
} from 'lucide-react';

export default function WarrantyPage() {
  const router = useRouter();
  const [warranties, setWarranties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Form States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Form Fields
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchWarranties(token);
  }, [router]);

  // Compute expiry date automatically when purchase date or warranty months change
  useEffect(() => {
    if (purchaseDate && warrantyMonths) {
      const pDate = new Date(purchaseDate);
      const months = parseInt(warrantyMonths);
      if (!isNaN(months) && !isNaN(pDate.getTime())) {
        pDate.setMonth(pDate.getMonth() + months);
        setExpiryDate(pDate.toISOString().split('T')[0]);
      }
    }
  }, [purchaseDate, warrantyMonths]);

  const fetchWarranties = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/warranty/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWarranties(data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarranty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !brand || !purchaseDate || !expiryDate) {
      alert('Please fill out all mandatory fields.');
      return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/warranty/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_name: productName,
          brand,
          purchase_date: purchaseDate,
          warranty_period_months: parseInt(warrantyMonths),
          expiry_date: expiryDate,
          notes
        })
      });
      if (res.ok) {
        alert('Warranty registered successfully!');
        setShowAddModal(false);
        resetForm();
        if (token) fetchWarranties(token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warranty entry?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/warranty/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Warranty entry deleted.');
        if (token) fetchWarranties(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setProductName('');
    setBrand('');
    setPurchaseDate('');
    setWarrantyMonths('12');
    setExpiryDate('');
    setNotes('');
  };

  // OCR Receipt Scanning
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
      alert('Could not access camera for scanning receipts.');
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
            const receiptFile = new File([blob], 'receipt_snap.jpg', { type: 'image/jpeg' });
            stopCamera();
            await processOCR(receiptFile);
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
    setShowAddModal(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', fileToScan);
    formData.append('doc_type', 'receipt');

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setProductName(data.product_name || '');
        setBrand(data.brand || '');
        setPurchaseDate(data.purchase_date || '');
        setWarrantyMonths(data.warranty_period_months?.toString() || '12');
        setExpiryDate(data.expiry_date || '');
        alert('Warranty information successfully extracted from receipt! Please verify all auto-filled fields.');
      } else {
        alert('Receipt scanning failed. Falling back to manual details entry.');
      }
    } catch (e) {
      console.error(e);
      alert('Error parsing receipt. Please enter details manually.');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  // Remaining days and color coding tags
  const getWarrantyStatus = (expiryDateStr: string) => {
    if (!expiryDateStr) return { tag: 'Unknown', color: 'bg-slate-100 text-slate-600', days: 0 };
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0,0,0,0);

    const diff = exp.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) {
      return { tag: 'Expired', color: 'bg-red-50 text-red-700 border border-red-200', days };
    } else if (days <= 30) {
      return { tag: 'Expiring Soon', color: 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse', days };
    } else {
      return { tag: 'Active', color: 'bg-green-50 text-green-700 border border-green-200', days };
    }
  };

  const filteredWarranties = warranties.filter(item => 
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-slate-700">Loading warranty database...</div>;

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 fixed inset-y-0 left-0 bg-white border-r border-slate-200 z-40 hidden sm:flex flex-col">
        <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-heading font-bold text-xl shadow-lg">N</div>
          <span className="hidden md:block ml-3 text-xl font-heading font-bold text-slate-900">NexusOS</span>
        </div>
        <div className="flex-1 py-8 px-4 space-y-2">
          {['Dashboard', 'Planning', 'Family', 'Vault', 'Settings', 'Warranty'].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Warranty' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
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
              <CalendarClock className="w-10 h-10 text-slate-900" /> Warranty & Expiry Tracker
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Keep track of product purchase receipts, warranty dates, and expiry alerts.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="btn-secondary h-12 py-0 px-6 flex items-center gap-2 border border-slate-200">
              <Camera className="w-5 h-5 text-slate-700" /> Scan Receipt (OCR)
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary h-12 py-0 px-6 flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Add Product
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search by product name or brand..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {filteredWarranties.length === 0 ? (
          <div className="premium-card p-12 text-center flex flex-col items-center justify-center">
            <FileText className="w-16 h-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No products tracked</h3>
            <p className="text-slate-500 mt-2">Scan a purchase receipt or manually add a product to track its warranty status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWarranties.map((item) => {
              const status = getWarrantyStatus(item.expiry_date);
              return (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded uppercase">
                          {item.brand}
                        </span>
                        <h3 className="text-xl font-heading font-bold text-slate-900 mt-2">{item.product_name}</h3>
                      </div>
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${status.color}`}>
                        {status.tag}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-1.5 mb-6">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-xs uppercase">Purchased</span>
                        <span className="font-bold text-slate-700">{item.purchase_date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-semibold text-xs uppercase">Expires</span>
                        <span className="font-bold text-slate-750">{item.expiry_date}</span>
                      </div>
                      {status.days > 0 ? (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold text-xs uppercase">Days Left</span>
                          <span className="font-bold text-brand-green">{status.days} days</span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-semibold text-xs uppercase">Expired</span>
                          <span className="font-bold text-red-500">{Math.abs(status.days)} days ago</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-medium truncate max-w-[150px]">
                      {item.notes || 'No additional notes'}
                    </span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Product Modal */}
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Warranty Details</h3>
                <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {isOCRProcessing ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <Loader2 className="w-12 h-12 text-brand-blue animate-spin mb-4" />
                  <p className="font-semibold text-slate-700">Analyzing Receipt via Gemini AI...</p>
                  <p className="text-xs text-slate-400 mt-2">Extracting product details, brand, purchase, and warranty dates</p>
                </div>
              ) : (
                <form onSubmit={handleAddWarranty} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Scan Receipt for Auto-Fill</label>
                    <input type="file" accept="image/*" onChange={handleFileUploadScan} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      value={productName} 
                      onChange={(e) => setProductName(e.target.value)} 
                      required 
                      className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                      placeholder="e.g. iPhone 15 Pro Max" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Brand</label>
                      <input 
                        type="text" 
                        value={brand} 
                        onChange={(e) => setBrand(e.target.value)} 
                        required 
                        className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                        placeholder="e.g. Apple" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Purchase Date</label>
                      <input 
                        type="date" 
                        value={purchaseDate} 
                        onChange={(e) => setPurchaseDate(e.target.value)} 
                        required 
                        className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Warranty Period (Months)</label>
                      <input 
                        type="number" 
                        value={warrantyMonths} 
                        onChange={(e) => setWarrantyMonths(e.target.value)} 
                        required 
                        className="w-full h-12 px-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                        placeholder="12" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Computed Expiry Date</label>
                      <input 
                        type="date" 
                        value={expiryDate} 
                        onChange={(e) => setExpiryDate(e.target.value)} 
                        required 
                        className="w-full h-12 px-4 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Notes (Optional)</label>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      rows={2} 
                      className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold" 
                      placeholder="e.g. Serial Number, store location"
                    ></textarea>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600">Cancel</button>
                    <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center">
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Product'}
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Scan Product Receipt</h3>
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
