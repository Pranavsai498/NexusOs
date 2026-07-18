'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertOctagon, PhoneCall, Shield, FileWarning, HeartPulse, 
  Lock, ArrowLeft, Download, Plus, FileText, CheckCircle
} from 'lucide-react';

const EMERGENCY_MED_INFO: Record<string, { blood: string; allergies: string; meds: string; contact: string; phone: string }> = {
  "self": {
    blood: "O+",
    allergies: "None",
    meds: "None",
    contact: "Sita Kumar (Spouse)",
    phone: "+91 98765 43211"
  },
  "venkat": {
    blood: "B+",
    allergies: "Penicillin",
    meds: "Amlodipine 5mg (Daily for BP), Metformin 500mg",
    contact: "Ramesh Kumar (Son)",
    phone: "+91 98765 43210"
  },
  "sarah": {
    blood: "O+",
    allergies: "Dust / Pollen",
    meds: "None",
    contact: "Ramesh Kumar (Father)",
    phone: "+91 98765 43210"
  }
};

export default function EmergencyPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  useEffect(() => {
    async function loadEmergencyData() {
      const token = localStorage.getItem('token');
      // In a real emergency situation, we bypass authentication checks or fetch public-safe emergency assets
      // For this demo context, we fetch from our local backend. If token is missing, we use standard Ramesh seeder fallbacks
      try {
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};
        
        const [resFamily, resDocs] = await Promise.all([
          fetch('http://localhost:8000/api/v1/family', { headers }),
          fetch('http://localhost:8000/api/v1/documents/', { headers })
        ]);
        
        if (resFamily.ok) {
          const fm = await resFamily.json();
          setFamilyMembers(fm || []);
        }
        if (resDocs.ok) {
          const docs = await resDocs.json();
          setDocuments(docs || []);
        }
      } catch (e) {
        console.error("Failed loading emergency endpoints:", e);
      } finally {
        setLoading(false);
      }
    }
    loadEmergencyData();
  }, []);

  const getEmergencyMeds = (memberId: string, name: string) => {
    if (memberId === 'self' || name.toLowerCase().includes('ramesh')) {
      return EMERGENCY_MED_INFO['self'];
    }
    if (name.toLowerCase().includes('venkat')) {
      return EMERGENCY_MED_INFO['venkat'];
    }
    if (name.toLowerCase().includes('sarah')) {
      return EMERGENCY_MED_INFO['sarah'];
    }
    return {
      blood: "A+ (Pending Confirm)",
      allergies: "None reported",
      meds: "None",
      contact: "Ramesh Kumar (Primary)",
      phone: "+91 98765 43210"
    };
  };

  // Only Health or Insurance documents are unlocked
  const emergencyDocs = documents.filter(doc => 
    doc.category === 'Health' || doc.category === 'Insurance' || doc.card_type === 'Health Insurance Policy'
  );

  const sensitiveDocs = documents.filter(doc => 
    doc.category !== 'Health' && doc.category !== 'Insurance' && doc.card_type !== 'Health Insurance Policy'
  );

  return (
    <div className="min-h-screen bg-red-50/30 pb-20">
      
      {/* Red Alert Header Banner */}
      <div className="bg-red-600 text-white py-3.5 px-4 text-center text-sm font-bold shadow-md flex items-center justify-center gap-2">
        <AlertOctagon className="w-5 h-5 animate-pulse" />
        <span>EMERGENCY BREAK-GLASS MODE ACTIVE — NO PIN SECURITY REQUIRED</span>
      </div>

      <nav className="bg-white border-b border-red-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-red-600 animate-pulse" />
            <span className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">NexusOS Emergency</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black font-heading text-red-950 tracking-tight">Family Medical & Insurance Folder</h1>
          <p className="mt-2 text-slate-600 font-medium text-sm leading-relaxed">
            Immediate access to medical rosters, blood groups, allergies, and health policies for hospital personnel. 
            All other government IDs and financial records remain encrypted.
          </p>
        </div>

        {/* Privacy Shield Disclaimer */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm flex items-start gap-4 max-w-3xl mx-auto">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Automated Vault Privacy Isolation</h4>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Aadhaar Cards, PAN Cards, Tax Returns, and Bank statements are strictly filtered out and locked from this view. 
              Only emergency health policies and medical prescriptions are downloadable.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-500 font-medium">Syncing emergency locker...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Cols: Family medical rosters */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Family Medical Roster</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Ramesh portfolio */}
                <motion.div 
                  whileHover={{ y: -3 }}
                  className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-3xl">👨</span>
                    <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Blood: O+</span>
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-slate-900 text-lg">Ramesh Kumar</h3>
                    <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">Primary Owner</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 space-y-2 text-xs font-medium">
                    <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Allergies</span> None</p>
                    <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Medications</span> None</p>
                    <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Emergency Contact</span> Sita Kumar (Spouse) • +91 98765 43211</p>
                  </div>
                </motion.div>

                {/* Venkat portfolio */}
                {familyMembers.map((member) => {
                  const med = getEmergencyMeds(member.id || member._id, member.name);
                  return (
                    <motion.div 
                      key={member.id || member._id}
                      whileHover={{ y: -3 }}
                      className="bg-white border border-red-100 rounded-3xl p-6 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-3xl">{member.relation === 'Parent' ? '👴' : '👧'}</span>
                        <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">Blood: {med.blood}</span>
                      </div>
                      <div>
                        <h3 className="font-heading font-extrabold text-slate-900 text-lg">{member.name}</h3>
                        <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">{member.relation}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs font-medium">
                        <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Allergies</span> {med.allergies}</p>
                        <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Medications</span> {med.meds}</p>
                        <p className="text-slate-600"><span className="text-slate-400 block font-bold uppercase text-[9px] tracking-wider">Emergency Contact</span> {med.contact} • {med.phone}</p>
                      </div>
                    </motion.div>
                  );
                })}

              </div>
            </div>

            {/* Right Col: Unlocked medical policy documents & Locked government IDs */}
            <div className="space-y-8">
              
              {/* Unlocked medical cards */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Unlocked Policy Documents</h2>
                {emergencyDocs.length === 0 ? (
                  <div className="bg-white border border-dashed border-red-200 rounded-3xl p-6 text-center text-slate-400">
                    <FileWarning className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">No medical insurance documents uploaded in vault.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emergencyDocs.map((doc) => (
                      <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3">
                          <span className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                            <HeartPulse className="w-5 h-5" />
                          </span>
                          <div className="text-left">
                            <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{doc.filename}</h4>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">{doc.card_type || 'Health Policy'}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading document content: \n\n${doc.content}`)}
                          className="p-2 bg-slate-100 hover:bg-red-600 hover:text-white rounded-xl text-slate-700 transition-colors shadow-inner"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Locked list */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">Locked Sensitive Assets</h2>
                <div className="bg-slate-900/5 border border-slate-200 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">LOCKED ({sensitiveDocs.length} files)</span>
                  </div>
                  <ul className="text-xs text-slate-500 font-semibold space-y-1.5 list-disc pl-4">
                    {sensitiveDocs.map((doc, idx) => (
                      <li key={doc.id || idx} className="truncate max-w-[200px]">
                        {doc.filename} (Encrypted)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>
    </div>
  );
}
