'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Landmark, Search, Sparkles, Calendar, BadgeCheck, AlertTriangle, 
  ArrowRight, CheckCircle, Upload, X, ShieldAlert, ArrowLeft,
  GraduationCap, ClipboardList, HelpCircle, Loader2, Info
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Scholarships', icon: '🎓' },
  { name: 'Pension', icon: '👴' },
  { name: 'Agriculture', icon: '🌾' },
  { name: 'Housing', icon: '🏠' },
  { name: 'Child Welfare', icon: '👶' },
  { name: 'Women Schemes', icon: '👩' },
  { name: 'Disability', icon: '🧑' },
  { name: 'Employment', icon: '💼' },
  { name: 'Certificates', icon: '📄' },
  { name: 'Health Schemes', icon: '🏥' },
  { name: 'Subsidies', icon: '💰' },
  { name: 'Education', icon: '📚' },
  { name: 'Crop Loans', icon: '🚜' }
];

export default function GovernmentPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Modals & Sidebars
  const [showRadarDrawer, setShowRadarDrawer] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('');

  // Certificate Assistant Wizard states
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardPurpose, setWizardPurpose] = useState('');

  // Local uploads & applies tracking
  const [appliedSchemes, setAppliedSchemes] = useState<string[]>([]);
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchGovtData(token);
  }, [router]);

  const fetchGovtData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/government/insights', {
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

  const handleApply = async (schemeName: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/government/apply', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ scheme_name: schemeName })
      });
      if (res.ok) {
        alert(`Successfully applied for ${schemeName}! Tracks added to your dashboard.`);
        setAppliedSchemes(prev => [...prev, schemeName]);
        if (token) fetchGovtData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDocumentUpload = (docType: string) => {
    setUploadDocType(docType);
    setShowDocUploadModal(true);
  };

  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingDocName(uploadDocType);
    const token = localStorage.getItem('token');
    
    // Simulate file upload (creates document in DB)
    const formData = new FormData();
    const mockFile = new Blob(["Seeded cert upload"], { type: 'text/plain' });
    formData.append('file', mockFile, `${uploadDocType.toLowerCase().replace(/ /g, '_')}.pdf`);
    formData.append('card_type', uploadDocType);
    formData.append('category', 'Government IDs');
    formData.append('extracted_name', 'Sarah Kumar');

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert(`${uploadDocType} uploaded and verified successfully! Scheme checklists updated.`);
        setShowDocUploadModal(false);
        if (token) fetchGovtData(token);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploadingDocName(null);
    }
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Matching Family Eligibility...</p>
    </div>
  );

  // Filter schemes based on search & category
  const filteredSchemes = data.recommended.filter((scheme: any) => {
    const matchesSearch = scheme.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scheme.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory ? scheme.category === activeCategory : true;
    return matchesSearch && matchesCat;
  });

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
              🏛️ Government Services
            </h1>
            <p className="mt-2 text-slate-500 font-medium">Discover scheme eligibility, audit required certs, and apply via AI.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowAssistantModal(true)}
              className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm"
            >
              📜 Certificate Assistant
            </button>
            <button 
              onClick={() => setShowRadarDrawer(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Opportunity Radar
            </button>
          </div>
        </div>

        {/* 1. Demographics Metrics summaries */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          
          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Recommended</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.recommended_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Applied Benefits</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{data.summary.applied_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Approved benefits</span>
            <div className="text-3xl font-black text-brand-green mt-2">{data.summary.approved_count}</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[20px] p-5 shadow-sm flex flex-col justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Pending Actions</span>
            <div className="text-3xl font-black text-brand-amber mt-2">{data.summary.pending_count}</div>
          </div>

        </div>

        {/* Search & Filters */}
        <div className="relative group mb-8 max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search matching scholarships, crop benefits, pensions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-medium text-slate-700 placeholder:text-slate-400"
          />
        </div>

        {/* 2. Category Grid */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === null 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.name 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Core Content Grid: Match recommendations & tracker lists */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Matched Schemes (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Demographic Matches</h2>
            
            {filteredSchemes.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-medium">
                No matching schemes found for this category filters.
              </div>
            ) : (
              filteredSchemes.map((scheme: any) => {
                const isAlreadyApplied = appliedSchemes.includes(scheme.title);
                return (
                  <div key={scheme.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 font-extrabold text-[10px] uppercase rounded">
                          {scheme.category}
                        </span>
                        <h3 className="font-heading font-extrabold text-slate-900 text-xl mt-2">{scheme.title}</h3>
                      </div>
                      
                      {scheme.eligible ? (
                        <span className="flex items-center gap-1 bg-green-50 text-brand-green px-3 py-1 rounded-full text-xs font-bold shrink-0">
                          <BadgeCheck className="w-4 h-4" /> Eligible (92%)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-amber-50 text-brand-amber px-3 py-1 rounded-full text-xs font-bold shrink-0">
                          Pending Age Check
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Coverage / Benefit</span>
                        <span className="text-slate-800 font-extrabold">{scheme.benefit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profile Association</span>
                        <span className="text-brand-blue font-extrabold">{scheme.matching_member}</span>
                      </div>
                    </div>

                    {/* Required Documents check from Vault */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Vault Documents Check</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Object.entries(scheme.documents).map(([docName, isPresent]: any) => (
                          <div 
                            key={docName} 
                            className={`flex justify-between items-center px-4 py-3 rounded-2xl border text-xs font-bold ${
                              isPresent ? 'bg-emerald-50/30 border-emerald-100 text-slate-800' : 'bg-red-50/20 border-red-100 text-slate-500'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isPresent ? (
                                <CheckCircle className="w-4.5 h-4.5 text-brand-green shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4.5 h-4.5 text-brand-amber shrink-0 animate-pulse" />
                              )}
                              {docName}
                            </span>
                            
                            {!isPresent && (
                              <button 
                                onClick={() => handleDocumentUpload(docName)}
                                className="py-1 px-3 bg-slate-900 text-white rounded-lg text-[10px] hover:bg-brand-blue transition-colors shadow-inner"
                              >
                                Upload
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      {isAlreadyApplied ? (
                        <span className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl text-xs font-bold">
                          ✓ Applied (Pending Approval)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(scheme.title)}
                          disabled={Object.values(scheme.documents).includes(false)}
                          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-brand-blue disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 shadow-md transition-colors cursor-pointer"
                        >
                          Apply For Benefit
                        </button>
                      )}
                    </div>

                  </div>
                );
              })
            )}

          </div>

          {/* Tracker & Calendar (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 3. Application Tracker */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Applications Tracker</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                {data.trackers.map((track: any) => (
                  <div key={track.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight max-w-[140px] truncate" title={track.name}>
                        {track.name}
                      </h4>
                      <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md ${
                        track.status === 'Approved' ? 'bg-green-100 text-brand-green' : 'bg-amber-100 text-brand-amber animate-pulse'
                      }`}>
                        {track.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-2">
                      <span>Submitted: {track.submission_date}</span>
                      <span>Expected: {track.expected_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Government Calendar */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Services Calendar</h2>
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm divide-y divide-slate-100">
                {data.calendar.map((cal: any, idx: number) => (
                  <div key={idx} className="py-3 flex justify-between items-center gap-3 first:pt-0 last:pb-0 text-xs font-semibold">
                    <div>
                      <h4 className="text-slate-800 font-extrabold leading-tight">{cal.title}</h4>
                      <span className="text-[9px] text-slate-400 block mt-0.5 uppercase">{cal.type}</span>
                    </div>
                    <span className="px-2.5 py-1 bg-blue-50 text-brand-blue rounded-xl font-black text-center whitespace-nowrap">
                      {cal.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* WOW: Opportunity Radar Slide Drawer */}
      <AnimatePresence>
        {showRadarDrawer && (
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
                    <h3 className="text-2xl font-black font-heading text-slate-950">Opportunity Radar</h3>
                  </div>
                  <button onClick={() => setShowRadarDrawer(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {data.radar.map((rad: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{rad.title}</h4>
                        <span className="text-[9px] font-bold bg-amber-100 text-brand-amber px-2 py-0.5 rounded uppercase whitespace-nowrap">
                          {rad.deadline}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                        Benefits: {rad.benefit}. Associated with your family profiles.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <button 
                  onClick={() => {
                    setShowRadarDrawer(false);
                    router.push('/chat?q=Configure my government opportunity plan');
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-sm"
                >
                  Configure Schemes Roadmap
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Certificate Assistant QA Modal */}
      <AnimatePresence>
        {showAssistantModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black font-heading text-slate-900 flex items-center gap-2">
                  📜 Certificate Assistant
                </h3>
                <button onClick={() => { setShowAssistantModal(false); setWizardStep(1); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {wizardStep === 1 && (
                <div className="space-y-6">
                  <h4 className="font-bold text-slate-800 text-sm">Which certificate do you need to apply for?</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {["Income Certificate", "Caste Certificate", "Residence Certificate"].map((cert) => (
                      <button 
                        key={cert}
                        onClick={() => {
                          setWizardPurpose(cert);
                          setWizardStep(2);
                        }}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white rounded-2xl text-left font-bold text-xs transition-all flex justify-between items-center group cursor-pointer"
                      >
                        <span>{cert}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setWizardStep(1)} className="p-1 hover:bg-slate-100 rounded-full">
                      <ArrowLeft className="w-4.5 h-4.5 text-slate-500" />
                    </button>
                    <span className="text-xs font-bold text-slate-400">Back</span>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                    <span className="text-brand-blue text-[10px] font-bold uppercase tracking-wider block">Application Guide: {wizardPurpose}</span>
                    <div className="text-slate-700 mt-3 text-xs leading-relaxed space-y-3 font-medium">
                      <p>🏦 **Where to apply**: Local Meeseva Center, Tehsildar Office or e-Seva portal.</p>
                      <p>📄 **Required papers**: Aadhaar Card, Land tax slips/Salary slips, verification application.</p>
                      <p>⏳ **Estimated processing time**: 7 - 15 working days.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Action Items Checklist</span>
                    {[
                      "Download verified application form",
                      "Collect signature from local ward counselor",
                      "Upload to e-Seva web dashboard portal"
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                        <input type="checkbox" className="rounded text-brand-blue focus:ring-brand-blue" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setShowAssistantModal(false);
                      setWizardStep(1);
                      router.push('/chat?q=How to apply for ' + wizardPurpose);
                    }}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md text-xs cursor-pointer"
                  >
                    Discuss with Chat Assistant
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Document Upload Modal for Missing items */}
      <AnimatePresence>
        {showDocUploadModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-sm w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-900">Upload {uploadDocType}</h3>
                <button onClick={() => setShowDocUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleDocSubmit} className="space-y-4">
                <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-bold block">Drag file or click to select</span>
                  <span className="text-[10px] text-slate-400 block mt-1">PDF or JPEG files</span>
                </div>

                <button 
                  type="submit" 
                  disabled={uploadingDocName !== null}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {uploadingDocName ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Syncing Vault...</>
                  ) : (
                    'Confirm and Upload to Vault'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
