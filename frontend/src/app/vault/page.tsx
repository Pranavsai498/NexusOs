'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Upload, Camera, Users, Shield, 
  Trash2, X, Check, Loader2, Search, Filter, FolderPlus
} from 'lucide-react';

export default function VaultPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Upload and Camera state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>('self');
  const [cardType, setCardType] = useState<string>('Aadhaar Card');
  const [category, setCategory] = useState<string>('Identity');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraSnap, setIsCameraSnap] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch family members and documents on mount
  useEffect(() => {
    async function initPage() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      await Promise.all([fetchFamilyMembers(token), fetchDocuments(token)]);
      setIsPageLoading(false);
    }
    initPage();
  }, [router]);

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
      console.error(e);
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
      console.error(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setIsCameraSnap(false);
      setShowUploadModal(true);
    }
  };

  const startCamera = async () => {
    try {
      setShowCameraModal(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      alert('Could not access camera. Please check camera permissions in your browser.');
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
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `camera_snap_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFile(capturedFile);
            setIsCameraSnap(true);
            stopCamera();
            setShowUploadModal(true);
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    const token = localStorage.getItem('token');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('member_id', selectedMember);
    formData.append('card_type', cardType);
    formData.append('category', category);

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        alert('Document uploaded and stored successfully!');
        setFile(null);
        setShowUploadModal(false);
        if (token) fetchDocuments(token);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to reach backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    const token = localStorage.getItem('token');
    try {
      // Create a delete endpoint fallback or use search mapping
      alert('Delete feature: document removed from view');
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getMemberName = (id: string) => {
    if (id === 'self') return 'Self (Owner)';
    const member = familyMembers.find(m => m.id === id);
    return member ? member.name : 'General / Family';
  };

  // Filter documents based on sidebar selection and search query
  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.card_type && doc.card_type.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedMemberFilter === 'all') return matchesSearch;
    return matchesSearch && doc.member_id === selectedMemberFilter;
  });

  if (isPageLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-slate-700">Loading Secure Digital Vault...</div>;
  }

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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Vault' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Body */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Shield className="w-10 h-10 text-slate-900" /> Secure Digital Vault
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Verify card identity, extract text, and access secure files.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="btn-secondary h-12 py-0 px-6 flex items-center gap-2 border border-slate-200">
              <Camera className="w-5 h-5 text-slate-700" /> Scan with Camera
            </button>
            <label className="btn-primary h-12 py-0 px-6 cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" /> Upload File
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative group mb-10 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search documents by name, type, or tags..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Family Member Filter Sidebar */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm h-fit">
            <h3 className="text-sm font-heading font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" /> Family Filter
            </h3>
            <div className="space-y-1">
              <button 
                onClick={() => setSelectedMemberFilter('all')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold flex justify-between items-center ${selectedMemberFilter === 'all' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50/50'}`}
              >
                <span>All Members</span>
                <span className="bg-slate-200/70 text-slate-600 text-xs px-2 py-0.5 rounded-full">{documents.length}</span>
              </button>
              <button 
                onClick={() => setSelectedMemberFilter('self')}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold flex justify-between items-center ${selectedMemberFilter === 'self' ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50/50'}`}
              >
                <span>Self (Owner)</span>
                <span className="bg-slate-200/70 text-slate-600 text-xs px-2 py-0.5 rounded-full">{documents.filter(d => d.member_id === 'self').length}</span>
              </button>
              {familyMembers.map((member, idx) => {
                const memberId = member.id || member._id || `member-${idx}`;
                return (
                  <button 
                    key={memberId}
                    onClick={() => setSelectedMemberFilter(memberId)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-semibold flex justify-between items-center ${selectedMemberFilter === memberId ? 'bg-slate-50 text-slate-900' : 'text-slate-600 hover:bg-slate-50/50'}`}
                  >
                    <span className="truncate">{member.name}</span>
                    <span className="bg-slate-200/70 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                      {documents.filter(d => d.member_id === memberId).length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Documents Listing */}
          <div className="lg:col-span-3">
            {filteredDocs.length === 0 ? (
              <div className="premium-card p-12 text-center flex flex-col items-center justify-center">
                <FolderPlus className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No documents found</h3>
                <p className="text-slate-500 mt-2">Upload a verification card or document to populate this vault.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDocs.map((doc) => (
                  <motion.div 
                    key={doc.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="premium-card p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="p-3 bg-slate-100 rounded-xl text-slate-700">
                          <FileText className="w-6 h-6" />
                        </span>
                        <span className="px-3 py-1 bg-slate-900 text-white font-bold text-xs rounded-md uppercase tracking-wider shadow-sm">
                          {doc.card_type || doc.category || 'General'}
                        </span>
                      </div>
                      
                      <h3 className="font-heading font-bold text-lg text-slate-900 mb-1 truncate" title={doc.filename}>
                        {doc.filename}
                      </h3>
                      
                      <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">
                        Belongs to: {getMemberName(doc.member_id)}
                      </p>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 leading-relaxed max-h-32 overflow-y-auto mb-4 font-mono text-xs">
                        {doc.content || 'Processing document chunks...'}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs text-slate-400 font-semibold">
                        Uploaded {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDelete(doc.id)} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Upload Confirmation Modal */}
      <AnimatePresence>
        {showUploadModal && file && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-heading font-bold text-slate-900">Document Settings</h3>
                <button onClick={() => { setFile(null); setShowUploadModal(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Selected File</label>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 truncate text-slate-700 font-semibold">
                    <FileText className="w-5 h-5 text-slate-400" /> {file.name}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Associate with Family Member</label>
                  <select 
                    value={selectedMember} 
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold text-slate-800"
                  >
                    <option value="self">Self (Owner)</option>
                    {familyMembers.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Card / Document Type</label>
                  <select 
                    value={cardType} 
                    onChange={(e) => {
                      setCardType(e.target.value);
                      if (e.target.value === 'Other') {
                        setCategory('General');
                      } else {
                        setCategory('Identity');
                      }
                    }}
                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-semibold text-slate-800"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driver License">Driver License</option>
                    <option value="Passport">Passport</option>
                    <option value="Insurance details">Insurance Document</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setShowUploadModal(false); }} 
                  disabled={isLoading}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload} 
                  disabled={isLoading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</> : 'Save & Secure'}
                </button>
              </div>
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Scan Card / Document</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-slate-100 mb-8 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100"></video>
                <div className="absolute inset-4 border-2 border-white/40 border-dashed rounded-xl pointer-events-none"></div>
              </div>

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button 
                  onClick={stopCamera} 
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600"
                >
                  Close
                </button>
                <button 
                  onClick={capturePhoto} 
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Camera className="w-5 h-5" /> Capture Card
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
