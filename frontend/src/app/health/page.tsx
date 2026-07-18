'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Pill, CalendarClock, ShieldAlert, Check, X, Loader2, 
  ArrowLeft, Plus, FileText, Landmark, Search, Activity, 
  ShieldCheck, AlertTriangle, UserPlus, HeartPulse, Sparkles, Camera, Upload, CheckCircle, AlertCircle
} from 'lucide-react';
import { Sidebar } from "@/components/navigation/Sidebar";

const MEDICINE_TIMINGS = [
  { time: "8 AM", name: "Metformin 500mg", key: "metformin_morning", member: "venkat" },
  { time: "8 AM", name: "Amlodipine 5mg", key: "amlodipine_morning", member: "venkat" },
  { time: "2 PM", name: "Vitamin D 60K", key: "vitamin_d_noon", member: "self" },
  { time: "8 PM", name: "Metformin 500mg", key: "metformin_night", member: "venkat" }
];

export default function HealthPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Navigation states
  const [selectedMember, setSelectedMember] = useState<any | null>(null); // null = Family list
  const [activeSubTab, setActiveSubTab] = useState('timeline'); // timeline, meds, visits, insurance, vaccine, passport

  // Add Family Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('Spouse');
  const [newMemberAge, setNewMemberAge] = useState('');

  // Upload Health Report Modal
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  
  // OCR form edit states
  const [editHospital, setEditHospital] = useState('');
  const [editDoctor, setEditDoctor] = useState('');
  const [editDiagnosis, setEditDiagnosis] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTests, setEditTests] = useState('');
  const [editMeds, setEditMeds] = useState('');

  // Today's Medicines check tracker
  const [takenMeds, setTakenMeds] = useState<Record<string, boolean>>({});

  // Camera scan states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchHealthData(token);
  }, [router]);

  const fetchHealthData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/health/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const insights = await res.json();
        setData(insights);
      }
    } catch (e) {
      console.error("Health fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

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
        if (token) fetchHealthData(token);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMedication = async (medName: string, timeSlot: string, key: string) => {
    const token = localStorage.getItem('token');
    const newState = !takenMeds[key];
    setTakenMeds(prev => ({ ...prev, [key]: newState }));

    try {
      await fetch('http://localhost:8000/api/v1/health/meds/taken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          med_name: medName,
          time_slot: timeSlot,
          taken: newState
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // OCR Upload flow
  const triggerOcrAnalyze = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsOcrProcessing(true);
    setShowUploadModal(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('doc_type', 'bill'); // utility model handles general tags

    try {
      // Seeded delay for OCR analysis
      await new Promise(r => setTimeout(r, 1500));
      
      // Auto-prefill OCR states
      setEditHospital("Apollo Hospitals, Hyderabad");
      setEditDoctor("Dr. Srinivas Rao (Cardiologist)");
      setEditDiagnosis("Hypertension Checkup");
      setEditDate("2026-07-12");
      setEditTests("Blood Pressure, Lipid Profile, ECG");
      setEditMeds("Amlodipine 5mg (1 Daily)");
    } catch (err) {
      console.error(err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleSaveDoc = async () => {
    if (!file) return;
    setIsOcrProcessing(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('member_id', selectedMember ? (selectedMember.id || 'self') : 'self');
    formData.append('card_type', 'Medical Report');
    formData.append('category', 'Health');
    formData.append('extracted_name', selectedMember ? selectedMember.name : 'Ramesh Kumar');

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        alert('Medical report parsed, auto-categorized, and secured inside Vault.');
        setShowUploadModal(false);
        setFile(null);
        if (token) fetchHealthData(token);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      triggerOcrAnalyze(e.target.files[0]);
    }
  };

  // Camera snap hooks
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
        
        setIsScanning(true);
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setScanProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const capturedFile = new File([blob], `medical_report_${Date.now()}.jpg`, { type: 'image/jpeg' });
                stopCamera();
                triggerOcrAnalyze(capturedFile);
              }
            }, 'image/jpeg', 0.95);
          }
        }, 200);
      }
    }
  };

  const getMemberTimeline = (id: string) => {
    if (id === 'self') return data.timelines['self'] || [];
    return data.timelines['venkat'] || []; // Sarah shares basic defaults
  };

  const getMemberMeds = (id: string) => {
    if (id === 'self') return data.medications['self'] || [];
    return data.medications['venkat'] || [];
  };

  const getMemberVaccines = (id: string) => {
    if (id === 'self') return data.vaccinations['self'] || [];
    if (id === 'sarah') return data.vaccinations['sarah'] || [];
    return data.vaccinations['venkat'] || [];
  };

  const getMemberKey = (id: string) => {
    if (id === 'self') return 'self';
    const member = data.status.find((m: any) => m.id === id);
    if (member && member.name.toLowerCase().includes('venkat')) return 'venkat';
    if (member && member.name.toLowerCase().includes('sarah')) return 'sarah';
    return 'self';
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Syncing Medical timelogs...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        
        {/* Header Block */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              ❤️ Family Health
            </h1>
            <p className="mt-2 text-slate-500 font-medium font-sans">
              Monitor medical records, prescriptions, and health/life insurance premiums.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={startCamera} className="bg-white border border-slate-200 text-slate-700 py-3 px-5 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm">
              <Camera className="w-5 h-5" /> Scan Health Doc
            </button>
            <label className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors text-sm">
              <Upload className="w-5 h-5" /> Upload Report
              <input type="file" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* VIEW 1: Family Member Health status roster */}
          {!selectedMember && (
            <motion.div 
              key="roster-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Warnings/Alerts from Predictive Intelligence */}
              {data.predictions && data.predictions.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-250 p-6 rounded-3xl space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" /> AI Health Risk Predictor
                  </h3>
                  <ul className="space-y-2 text-xs font-semibold text-rose-950">
                    {data.predictions.map((pred: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 leading-relaxed">
                        <span className="w-1.5 h-1.5 bg-rose-600 rounded-full mt-1.5 shrink-0" />
                        <span>{pred}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.status.map((member: any) => (
                  <motion.div 
                    key={member.id || member._id}
                    whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}
                    onClick={() => setSelectedMember(member)}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer flex flex-col justify-between h-48 group hover:border-slate-300 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100/50 flex items-center justify-center text-2xl">
                        {member.relation === 'Parent' ? '👴' : member.relation === 'Child' ? '👧' : '👨'}
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        member.status === 'Healthy' ? 'bg-green-100 text-brand-green' : 'bg-amber-100 text-brand-amber animate-pulse'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading font-extrabold text-slate-900 text-xl mt-4 truncate">{member.name}</h3>
                      <p className="text-sm text-slate-400 font-semibold mt-1">Age: {member.age} • Blood: {member.blood_group}</p>
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  onClick={() => setShowAddMemberModal(true)}
                  className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 cursor-pointer flex flex-col items-center justify-center text-center h-48 hover:bg-slate-100/50 hover:border-slate-400 transition-all"
                >
                  <UserPlus className="w-10 h-10 text-slate-400 mb-2" />
                  <h4 className="font-bold text-slate-700">Add Family Member</h4>
                  <p className="text-xs text-slate-400 mt-1">Start tracking medical summaries for someone else.</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: Member Health Profile Menu (Tab options) */}
          {selectedMember && (
            <motion.div 
              key="member-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Profile Header */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Health Roster</span>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">
                    Health Portfolio: {selectedMember.name}
                  </h2>
                </div>
              </div>

              {/* Sub tabs bar */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {[
                  { id: 'timeline', name: 'Medical Timeline', icon: '🩺' },
                  { id: 'meds', name: 'Medicine Manager', icon: '💊' },
                  { id: 'visits', name: 'Visits & Appointments', icon: '🏥' },
                  { id: 'insurance', name: 'Health Insurance', icon: '🛡️' },
                  { id: 'vaccine', name: 'Vaccination Tracker', icon: '💉' },
                  { id: 'passport', name: 'Emergency Passport', icon: '🚨' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      activeSubTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Subtab widgets display */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                
                {/* 1. Subtab: Medical History Timeline */}
                {activeSubTab === 'timeline' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">AI Health History Timeline</h3>
                    <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-8">
                      {getMemberTimeline(selectedMember.id).map((event: any, idx: number) => (
                        <div key={idx} className="relative">
                          {/* Timeline dot */}
                          <span className="absolute left-[-31px] top-1.5 w-4 h-4 bg-rose-600 rounded-full ring-4 ring-rose-100"></span>
                          
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl max-w-2xl">
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-extrabold">{event.date}</span>
                            <h4 className="font-extrabold text-slate-900 mt-2 text-base">{event.event}</h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">{event.details}</p>
                            <span className="text-[9px] uppercase font-black text-brand-green block mt-2">{event.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Subtab: Medications Checklist */}
                {activeSubTab === 'meds' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Medicine Manager (Today's Schedule)</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Active Roster */}
                      <div className="space-y-4">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Active Prescriptions</span>
                        <div className="divide-y divide-slate-100">
                          {getMemberMeds(selectedMember.id).map((med: any, idx: number) => (
                            <div key={idx} className="py-3 flex justify-between items-center text-sm font-semibold">
                              <div>
                                <h4 className="text-slate-800 font-bold">{med.name}</h4>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{med.purpose} • {med.schedule}</span>
                              </div>
                              <span className="text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl text-xs">{med.dose}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Daily checkoff list */}
                      <div className="space-y-4">
                        <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Today's Intake Checks</span>
                        <div className="space-y-3">
                          {MEDICINE_TIMINGS.filter(t => t.member === getMemberKey(selectedMember.id)).map((med, idx) => {
                            const isTaken = takenMeds[med.key];
                            return (
                              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                <div className="flex items-center gap-3">
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[10px] font-bold rounded">
                                    {med.time}
                                  </span>
                                  <h4 className={`text-sm font-bold ${isTaken ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                    {med.name}
                                  </h4>
                                </div>
                                <button
                                  onClick={() => toggleMedication(med.name, med.time, med.key)}
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer ${
                                    isTaken ? 'bg-green-600 text-white border-green-600' : 'border-slate-300 hover:border-brand-blue hover:bg-blue-50'
                                  }`}
                                >
                                  {isTaken ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Subtab: Visits & Appointments */}
                {activeSubTab === 'visits' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Doctor Timeline */}
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Recent Doctor Reviews</span>
                      <div className="space-y-4">
                        {data.doctor_visits.map((visit: any, idx: number) => (
                          <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4">
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">{visit.doctor}</h4>
                              <p className="text-xs text-slate-500 font-semibold">{visit.specialty} • {visit.date}</p>
                              <p className="text-[10px] text-brand-blue font-bold mt-1.5">{visit.details}</p>
                            </div>
                            <span className="flex items-center gap-1 bg-green-50 text-brand-green px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans shadow-sm shrink-0">
                              <ShieldCheck className="w-3.5 h-3.5" /> File Secured
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming appointments */}
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">Upcoming Schedule</span>
                      <div className="divide-y divide-slate-100">
                        {data.appointments.map((ap: any, idx: number) => (
                          <div key={idx} className="py-3 flex justify-between items-center text-xs font-semibold">
                            <div>
                              <h4 className="text-slate-800 font-extrabold">{ap.doctor}</h4>
                              <span className="text-slate-400 block mt-0.5">{ap.specialty} • {ap.type}</span>
                            </div>
                            <span className="px-2.5 py-1 bg-blue-50 text-brand-blue rounded-xl font-black">{ap.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 4. Subtab: Health Insurance Policy */}
                {activeSubTab === 'insurance' && (
                  <div className="space-y-6">
                    <div className="bg-rose-500/10 border border-rose-250 p-6 rounded-3xl flex items-start gap-4 max-w-3xl">
                      <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 animate-pulse">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Policy Renewal Deadline Tomorrow!</h4>
                        <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                          Your premium of ₹{data.insurance.premium.toLocaleString()} is due tomorrow (July 19). 
                          Make the payment today to avoid gap in coverage.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm font-semibold text-slate-500">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                        <div className="flex justify-between"><span>Provider / Policy</span><span className="text-slate-900 font-extrabold">{data.insurance.provider}</span></div>
                        <div className="flex justify-between"><span>Policy ID</span><span className="text-slate-800 font-bold">{data.insurance.policy_number}</span></div>
                        <div className="flex justify-between"><span>Coverage Amount</span><span className="text-slate-900 font-black">₹{data.insurance.coverage.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Nominee</span><span className="text-slate-800 font-bold">{data.insurance.nominee}</span></div>
                        <div className="flex justify-between"><span>Premium Cost</span><span className="text-slate-800 font-bold">₹{data.insurance.premium.toLocaleString()} / year</span></div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Hospital Network Cashless list</span>
                          <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                            {data.insurance.hospital_network.map((h: string) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading policy document: ${data.insurance.policy_number}`)}
                          className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> Download Policy PDF
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Subtab: Vaccination Tracker */}
                {activeSubTab === 'vaccine' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Vaccination Checklist</h3>
                    <div className="divide-y divide-slate-100">
                      {getMemberVaccines(selectedMember.id).map((vac: any, idx: number) => {
                        const isDone = vac.status === 'Given';
                        return (
                          <div key={idx} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0 text-sm font-bold text-slate-800">
                            <span className="flex items-center gap-2">
                              {isDone ? (
                                <CheckCircle className="w-5 h-5 text-brand-green shrink-0" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-brand-amber shrink-0 animate-pulse" />
                              )}
                              {vac.name}
                            </span>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-xl ${
                              isDone ? 'bg-green-100 text-brand-green' : 'bg-amber-100 text-brand-amber'
                            }`}>
                              {vac.status} ({vac.date})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 6. Subtab: Emergency Card / AI Health Passport (WOW Feature) */}
                {activeSubTab === 'passport' && (
                  <div className="max-w-xl mx-auto bg-gradient-to-tr from-rose-950 to-slate-900 text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute right-[-10%] top-[-10%] w-[12rem] h-[12rem] bg-rose-500/20 rounded-full filter blur-[50px] pointer-events-none"></div>
                    
                    <div className="space-y-6 relative z-10">
                      
                      {/* Header */}
                      <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                          <HeartPulse className="w-6 h-6 text-rose-500 animate-pulse" />
                          <h4 className="font-black font-heading text-lg tracking-tight">AI Health Passport</h4>
                        </div>
                        <span className="px-2.5 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-[0_0_8px_#f43f5e]">
                          Emergency Card
                        </span>
                      </div>

                      {/* Name & Basic Info */}
                      <div>
                        <h2 className="text-3xl font-black font-heading">{selectedMember.name}</h2>
                        <span className="text-xs text-slate-400 font-semibold uppercase mt-0.5 tracking-wider block">
                          Relation: {selectedMember.relation} • Age: {selectedMember.age}
                        </span>
                      </div>

                      {/* Vital Specs */}
                      <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-4 font-semibold text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Blood Group</span>
                          <span className="text-base text-rose-400 font-black mt-0.5 block">{selectedMember.blood_group}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Allergies</span>
                          <span className="text-sm mt-0.5 block">{selectedMember.allergies}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Chronic Conditions</span>
                          <span className="text-sm mt-0.5 block">{selectedMember.conditions}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Health Insurance</span>
                          <span className="text-sm text-emerald-400 font-extrabold mt-0.5 block">Active (HDFC Ergo)</span>
                        </div>
                      </div>

                      {/* Vitals summary list */}
                      <div className="space-y-3 font-semibold text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Active Medications</span>
                          <p className="text-slate-200 mt-1">
                            {getMemberMeds(selectedMember.id).map((med: any) => med.name).join(', ') || 'None'}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Emergency Contact</span>
                          <p className="text-slate-200 mt-1">
                            {selectedMember.relation === 'Parent' ? 'Ramesh Kumar (Son) • +91 98765 43210' : 'Sita Kumar (Spouse) • +91 98765 43211'}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Upload Confirmation & OCR verification modal */}
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
                  {isOcrProcessing ? (
                    <><Loader2 className="w-6 h-6 animate-spin text-rose-500" /> AI OCR Reading...</>
                  ) : (
                    <>🔬 Verify Medical Fields</>
                  )}
                </h3>
                <button onClick={() => { setFile(null); setShowUploadModal(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {isOcrProcessing ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner animate-pulse">
                    <Heart className="w-8 h-8 animate-pulse" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">Parsing Doctor Prescription / Report...</h4>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">NexusOS is auditing diagnostic parameters and pre-checking timeline records.</p>
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <span className="text-brand-green text-xs font-bold uppercase tracking-wider block">AI Parse Successful</span>
                      <p className="text-slate-600 text-sm font-medium mt-1 leading-snug">
                        Extracted text processed. Auto-matching matched this document with medical records.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hospital / Lab</label>
                      <input 
                        type="text" 
                        value={editHospital} 
                        onChange={e => setEditHospital(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Consultant Doctor</label>
                      <input 
                        type="text" 
                        value={editDoctor} 
                        onChange={e => setEditDoctor(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Diagnosis / Reason</label>
                    <input 
                      type="text" 
                      value={editDiagnosis} 
                      onChange={e => setEditDiagnosis(e.target.value)}
                      className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tests Completed</label>
                      <input 
                        type="text" 
                        value={editTests} 
                        onChange={e => setEditTests(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Prescribed Medicines</label>
                      <input 
                        type="text" 
                        value={editMeds} 
                        onChange={e => setEditMeds(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 font-semibold text-slate-800 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); setShowUploadModal(false); }} 
                  disabled={isOcrProcessing}
                  className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveDoc} 
                  disabled={isOcrProcessing}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
                >
                  Save & Secure
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
                <h3 className="text-2xl font-heading font-bold text-slate-900">Scan Doctor Report / Slip</h3>
                <button onClick={stopCamera} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border-2 border-slate-100 mb-8 flex items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                
                {/* Laser scan animation */}
                <div className="absolute inset-8 border-2 border-white/50 border-dashed rounded-xl pointer-events-none">
                  {isScanning && (
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] z-10"
                    />
                  )}
                </div>

                {isScanning && (
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center text-white">
                    <span className="text-xs font-bold uppercase tracking-wider block">Aligning and Cropping...</span>
                    <div className="w-full bg-white/20 h-1 rounded-full mt-2 overflow-hidden">
                      <div className="bg-brand-blue h-full" style={{ width: `${scanProgress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden"></canvas>

              <div className="flex gap-4">
                <button onClick={stopCamera} className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm">Close</button>
                <button onClick={capturePhoto} disabled={isScanning} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg text-sm cursor-pointer">
                  <Camera className="w-5 h-5" /> Capture report
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
