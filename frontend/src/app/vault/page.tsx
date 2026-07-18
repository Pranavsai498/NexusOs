'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Camera, Users, Shield, Lock,
  Trash2, X, Check, Loader2, Search, ArrowLeft, Plus, 
  UserPlus, CheckCircle, AlertTriangle, AlertCircle, FileWarning, ExternalLink, HelpCircle
} from 'lucide-react';
import { Sidebar } from '@/components/navigation/Sidebar';

const CATEGORY_ITEMS: Record<string, string[]> = {
  "Government IDs": ["Aadhaar Card", "PAN Card", "Passport", "Driver License", "Voter ID", "Income Certificate", "Caste Certificate", "Residence Certificate", "Birth Certificate"],
  "Health": ["Health Insurance Policy", "Vaccine Certificate", "Medical Reports", "Prescription"],
  "Finance": ["ITR Tax Document", "Bank Statement", "Salary Slip"],
  "Insurance": ["Health Insurance Policy", "Life Insurance Policy", "Vehicle Insurance"],
  "Education": ["10th Marks Memo", "12th Marks Memo", "Degree Certificate", "Transfer Certificate", "Bonafide"],
  "Legal": ["Will", "Power of Attorney"],
  "Property": ["Property Registration Deed", "Land Tax"],
  "Others": ["General Attachment"]
};

const CATEGORY_ICONS: Record<string, string> = {
  "Government IDs": "🪪",
  "Health": "🏥",
  "Finance": "💰",
  "Insurance": "🛡",
  "Education": "🎓",
  "Legal": "⚖",
  "Property": "🏠",
  "Others": "📄"
};

export default function VaultPage() {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  
  const [documents, setDocuments] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Navigation states
  const [selectedMember, setSelectedMember] = useState<any | null>(null); // null = Home showing family list
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = Member profile showing categories

  // Add Family Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Spouse');
  const [newMemberAge, setNewMemberAge] = useState('');

  // Upload/OCR Flow states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null); // Verified OCR fields form
  
  // OCR Edit form inputs
  const [editDocType, setEditDocType] = useState('');
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editDocNumber, setEditDocNumber] = useState('');
  const [editExpiryDate, setEditExpiryDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMemberId, setEditMemberId] = useState('self');

  // Camera states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Security Verification check
  useEffect(() => {
    const verified = sessionStorage.getItem('vault_pin_verified');
    if (verified === 'true') {
      setIsUnlocked(true);
      initVault();
    }
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin })
      });
      if (res.ok) {
        sessionStorage.setItem('vault_pin_verified', 'true');
        setIsUnlocked(true);
        initVault();
      } else {
        setPinError('Invalid security PIN code.');
        setPin('');
      }
    } catch (err) {
      setPinError('Unable to connect to security backend.');
    }
  };

  const initVault = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    await Promise.all([fetchFamilyMembers(token), fetchDocuments(token), fetchProfile(token)]);
  };

  const fetchFamilyMembers = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/family', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFamilyMembers(data || []);
      }
    } catch (e) {
      console.error("Fetch family error:", e);
    }
  };

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch (e) {
      console.error("Fetch profile error:", e);
    }
  };

  const fetchDocuments = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data || []);
      }
    } catch (e) {
      console.error("Fetch docs error:", e);
    }
  };

  // Search logic (Semantic Intent Fallback)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      initVault();
      return;
    }
    setIsSearching(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/documents/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Map back search structure to docs
        const mappedDocs = data.results.map((r: any) => ({
          id: r.document_id || r._id,
          filename: r.filename,
          category: r.category,
          card_type: r.card_type,
          member_id: r.member_id,
          content: r.snippet,
          summary: r.summary,
          created_at: new Date().toISOString()
        }));
        setDocuments(mappedDocs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Add family member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/family', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newMemberName,
          relation: newMemberRelation,
          age: parseInt(newMemberAge)
        })
      });
      if (res.ok) {
        setShowAddMemberModal(false);
        setNewMemberName('');
        setNewMemberAge('');
        if (token) fetchFamilyMembers(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Document Delete endpoint hook
  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document from the vault?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => (d.id || d._id) !== docId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // OCR Upload / Processing Flow
  const triggerOcrAnalyze = async (selectedFile: File, typeTag?: string) => {
    setFile(selectedFile);
    setIsOcrLoading(true);
    setShowUploadModal(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_type', 'identity'); // standard general passport/Aadhaar/DL OCR

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/ocr', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setOcrResult(data);
        
        // Populate edit states
        setEditDocType(data.document_type || typeTag || 'Aadhaar Card');
        setEditName(data.name || '');
        setEditDob(data.dob || '');
        setEditDocNumber(data.document_number || '');
        setEditExpiryDate(data.expiry_date || '');
        setEditCategory(data.category || selectedCategory || 'Government IDs');
        setEditMemberId(selectedMember ? (selectedMember.id || selectedMember._id || 'self') : 'self');
      } else {
        alert('AI OCR extraction timed out. Please enter details manually.');
        setOcrResult({});
        setEditDocType(typeTag || 'Aadhaar Card');
        setEditCategory(selectedCategory || 'Government IDs');
      }
    } catch (err) {
      console.error("OCR upload error:", err);
      setOcrResult({});
      setEditDocType(typeTag || 'Aadhaar Card');
      setEditCategory(selectedCategory || 'Government IDs');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!file) return;
    setIsOcrLoading(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('member_id', editMemberId);
    formData.append('card_type', editDocType);
    formData.append('category', editCategory);
    formData.append('expiry_date', editExpiryDate);
    formData.append('extracted_name', editName);
    formData.append('dob', editDob);
    formData.append('document_number', editDocNumber);

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        setShowUploadModal(false);
        setFile(null);
        setOcrResult(null);
        if (token) fetchDocuments(token);
      } else {
        alert('Failed to save document. Please try again.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, typeTag?: string) => {
    if (e.target.files && e.target.files[0]) {
      triggerOcrAnalyze(e.target.files[0], typeTag);
    }
  };

  // Camera capture hooks
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
      alert('Could not start video stream.');
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

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Crop animation simulation
        setIsScanning(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setScanProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const capturedFile = new File([blob], `camera_doc_${Date.now()}.jpg`, { type: 'image/jpeg' });
                stopCamera();
                triggerOcrAnalyze(capturedFile);
              }
            }, 'image/jpeg', 0.95);
          }
        }, 300);
      }
    }
  };

  // Document count metrics
  const getDocumentCount = (memberId: string) => {
    return documents.filter(d => d.member_id === memberId || (!d.member_id && memberId === 'self')).length;
  };

  const getMemberDocsInCategory = (memberId: string, cat: string) => {
    return documents.filter(d => (d.member_id === memberId || (!d.member_id && memberId === 'self')) && d.category === cat);
  };

  // PIN Unlock screen gate
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative glows */}
        <div className="absolute right-[-10%] top-[-10%] w-[30rem] h-[30rem] bg-brand-blue/15 rounded-full filter blur-[100px] pointer-events-none"></div>
        <div className="absolute left-[-10%] bottom-[-10%] w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full filter blur-[100px] pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/70 border border-slate-200/50 backdrop-blur-md rounded-[32px] p-8 shadow-2xl max-w-md w-full text-center relative z-10"
        >
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-slate-900 tracking-tight">Vault Encryption Gate</h1>
          <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
            Please enter your 4-digit security PIN to access the encrypted family document vault.
          </p>

          <form onSubmit={handlePinSubmit} className="mt-8 space-y-6">
            <input 
              type="password" 
              value={pin}
              maxLength={4}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setPinError('');
              }}
              placeholder="••••"
              className="w-32 h-14 bg-white border-2 border-slate-200 focus:border-brand-blue focus:outline-none focus:ring-4 focus:ring-brand-blue/10 rounded-2xl text-center text-3xl font-bold tracking-[8px] transition-all"
            />
            {pinError && (
              <p className="text-xs font-semibold text-brand-red flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pinError}
              </p>
            )}

            <button 
              type="submit" 
              disabled={pin.length < 4}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-base font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 disabled:bg-slate-300"
            >
              Verify PIN Code
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />

      {/* Main vault area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">📂</span>
              <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Secure Digital Vault</h1>
            </div>
            <p className="mt-2 text-slate-500 font-medium">Verify card identity, audit documents, and access encrypted files.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors">
              <Camera className="w-5 h-5" /> Scan Document
            </button>
            <label className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors">
              <Upload className="w-5 h-5" /> Upload File
              <input type="file" onChange={(e) => handleFileChange(e)} className="hidden" />
            </label>
          </div>
        </div>

        {/* Global search */}
        <form onSubmit={handleSearch} className="relative group mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Type 'Scholarship Document' or search specific files..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-24 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-brand-blue transition-colors cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <AnimatePresence mode="wait">
          {/* VIEW 1: Home View (List of Family Members) */}
          {!selectedMember && (
            <motion.div 
              key="member-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest font-heading">Family Portfolios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Self Card */}
                <motion.div 
                  whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                  onClick={() => setSelectedMember({ id: 'self', name: `${currentUser?.full_name || 'Ramesh Kumar'} (Self)`, relation: 'Owner' })}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer flex flex-col justify-between h-48 group hover:border-slate-300 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">👨</div>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">Owner</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-slate-900 text-xl mt-4">{currentUser?.full_name || 'Ramesh Kumar'}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{getDocumentCount('self')} Documents</p>
                  </div>
                </motion.div>

                {/* Seeding / Family Members List */}
                {familyMembers.map((member) => (
                  <motion.div 
                    key={member.id || member._id}
                    whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                    onClick={() => setSelectedMember(member)}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer flex flex-col justify-between h-48 group hover:border-slate-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">
                        {member.relation === 'Parent' ? '👴' : member.relation === 'Spouse' ? '👩' : '👧'}
                      </div>
                      <span className="text-xs bg-indigo-100/50 text-indigo-700 font-bold px-2 py-0.5 rounded-full">{member.relation}</span>
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-slate-900 text-xl mt-4 truncate">{member.name}</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">{getDocumentCount(member.id || member._id)} Documents</p>
                    </div>
                  </motion.div>
                ))}

                {/* Add Member Trigger Card */}
                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 cursor-pointer flex flex-col items-center justify-center text-center h-48 hover:bg-slate-100/50 hover:border-slate-400 transition-all"
                >
                  <UserPlus className="w-10 h-10 text-slate-400 mb-2" />
                  <h4 className="font-bold text-slate-700">Add Family Member</h4>
                  <p className="text-xs text-slate-400 mt-1">Start tracking documents for someone else.</p>
                </motion.div>

              </div>
            </motion.div>
          )}

          {/* VIEW 2: Member Details (Show Categories) */}
          {selectedMember && !selectedCategory && (
            <motion.div 
              key="category-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Portfolio</span>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">
                    Portfolio for {selectedMember.name}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.keys(CATEGORY_ITEMS).map((cat) => {
                  const items = getMemberDocsInCategory(selectedMember.id || selectedMember._id || 'self', cat);
                  const reqs = CATEGORY_ITEMS[cat].length;
                  return (
                    <motion.div 
                      key={cat}
                      whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}
                      onClick={() => setSelectedCategory(cat)}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer flex flex-col justify-between h-40 group hover:border-slate-300 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
                        <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          {items.length} file{items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg mt-3">{cat}</h3>
                        <p className="text-xs text-slate-400 font-semibold mt-1">Audit: {items.length}/{reqs} standard files</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* VIEW 3: Category Detail (Checklist of available & missing documents) */}
          {selectedMember && selectedCategory && (
            <motion.div 
              key="document-checklist"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Categories</span>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">
                    {selectedCategory} Checklist for {selectedMember.name}
                  </h2>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Document Audit</h3>
                <div className="divide-y divide-slate-100">
                  {CATEGORY_ITEMS[selectedCategory].map((docType) => {
                    const matchedDocs = documents.filter(d => {
                      const memberMatch = d.member_id === (selectedMember.id || selectedMember._id || 'self') || 
                                          (!d.member_id && (selectedMember.id || selectedMember._id || 'self') === 'self');
                      const categoryMatch = d.category === selectedCategory;
                      if (!memberMatch || !categoryMatch || !d.card_type) return false;
                      
                      const t1 = d.card_type.toLowerCase().replace(/['\s_-]+/g, '').replace(/aa/g, 'a');
                      const t2 = docType.toLowerCase().replace(/['\s_-]+/g, '').replace(/aa/g, 'a');
                      
                      if (t1 === t2) return true;
                      if (t2.includes('adhar') && t1.includes('adhar')) return true;
                      if (t2.includes('driver') && (t1.includes('driver') || t1.includes('driving'))) return true;
                      return false;
                    });
                    
                    const isAvailable = matchedDocs.length > 0;

                    return (
                      <div key={docType} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 first:pt-0 last:pb-0">
                        {/* Name of document slot */}
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-brand-amber shrink-0 animate-pulse" />
                            )}
                            {docType}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">Required for identity verify & general applications.</p>
                        </div>

                        {/* Status detail & action controls */}
                        <div className="flex items-center gap-4 justify-between sm:justify-start">
                          {isAvailable ? (
                            matchedDocs.map(doc => (
                              <div key={doc.id || doc._id} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
                                <FileText className="w-4 h-4 text-slate-400" />
                                <div className="text-left max-w-xs">
                                  <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{doc.filename}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{doc.summary || 'Encrypted'}</p>
                                </div>
                                <div className="flex gap-1.5 ml-2">
                                  {doc.expiry_date && (
                                    <span className="text-[9px] font-extrabold bg-amber-50 text-brand-amber px-2 py-0.5 rounded-full uppercase">
                                      Expiry: {new Date(doc.expiry_date).toLocaleDateString()}
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteDocument(doc.id || doc._id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete file"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-brand-amber bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl uppercase">
                                Missing
                              </span>
                              <label className="py-1.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue cursor-pointer transition-colors flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5" /> Upload
                                <input 
                                  type="file" 
                                  onChange={(e) => handleFileChange(e, docType)} 
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* OCR Verify & Review Edit Modal */}
      <AnimatePresence>
        {showUploadModal && file && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  {isOcrLoading ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-brand-blue" /> AI Analyzing...</>
                  ) : (
                    <>🔬 Verify OCR Details</>
                  )}
                </h3>
                <button onClick={() => { setFile(null); setOcrResult(null); setShowUploadModal(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {isOcrLoading ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-50 text-brand-blue rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Shield className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">Running Gemini OCR OCR Engine...</h4>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">NexusOS is identifying fields, parsing text lines, and auditing database matches.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <span className="text-brand-green text-xs font-bold uppercase tracking-wider block">AI Match Complete</span>
                      <p className="text-slate-600 text-sm font-medium mt-1 leading-snug">
                        Extracted text processed. Auto-matching matched this document with profile data.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Document Type</label>
                    <input 
                      type="text" 
                      value={editDocType} 
                      onChange={e => setEditDocType(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Name on Document</label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={e => setEditName(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">DOB / Issue Date</label>
                      <input 
                        type="text" 
                        value={editDob} 
                        placeholder="DD-MM-YYYY"
                        onChange={e => setEditDob(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Document Number</label>
                      <input 
                        type="text" 
                        value={editDocNumber} 
                        onChange={e => setEditDocNumber(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Expiry Date</label>
                      <input 
                        type="text" 
                        value={editExpiryDate} 
                        placeholder="YYYY-MM-DD"
                        onChange={e => setEditExpiryDate(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Vault Category</label>
                      <select 
                        value={editCategory} 
                        onChange={e => setEditCategory(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      >
                        {Object.keys(CATEGORY_ITEMS).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Assign Member Portfolio</label>
                      <select 
                        value={editMemberId} 
                        onChange={e => setEditMemberId(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                      >
                        <option value="self">{(currentUser?.full_name || 'Ramesh Kumar')} (Self)</option>
                        {familyMembers.map(m => (
                          <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setOcrResult(null); setShowUploadModal(false); }} 
                  disabled={isOcrLoading}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDocument} 
                  disabled={isOcrLoading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
                >
                  Save & Secure
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Camera Capture Modal with Scanner cropping lines */}
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Scan Card / Document</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-slate-100 mb-8 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
                
                {/* Simulated scanner lines */}
                <div className="absolute inset-8 border-2 border-white/50 border-dashed rounded-xl pointer-events-none">
                  {/* Laser line animation */}
                  {isScanning && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-brand-red shadow-[0_0_8px_#ef4444] z-10"
                    />
                  )}
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider block">AI Cropping & Straightening...</span>
                    <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-blue h-full" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button 
                  onClick={stopCamera} 
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                >
                  Close
                </button>
                <button 
                  onClick={capturePhoto} 
                  disabled={isScanning}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm cursor-pointer"
                >
                  <Camera className="w-5 h-5" /> Capture Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add family member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Add Family Member</h3>
                <button onClick={() => setShowAddMemberModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    value={newMemberName} 
                    required
                    onChange={e => setNewMemberName(e.target.value)}
                    placeholder="e.g. Sarah Kumar"
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Relation</label>
                    <select 
                      value={newMemberRelation} 
                      onChange={e => setNewMemberRelation(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Parent">Parent</option>
                      <option value="Child">Child</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Age</label>
                    <input 
                      type="number" 
                      value={newMemberAge} 
                      required
                      onChange={e => setNewMemberAge(e.target.value)}
                      placeholder="e.g. 19"
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddMemberModal(false)} 
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
                  >
                    Add Portfolio
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
