'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, BookOpen, Award, Calendar, Sparkles, Check, 
  X, ChevronRight, Code, FileText, ArrowLeft, ArrowRight,
  TrendingUp, Star, ShieldCheck, ClipboardList, Briefcase, Plus, Loader2, Copy
} from 'lucide-react';

export default function EducationPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // View states
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null); // null = Student List
  const [activeTab, setActiveTab] = useState('academics'); // academics, scholarships, exams, career, skills, certs, resume, internships, timeline

  // Resume builder states
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);

  // Edit Goal modal state
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [targetGoal, setTargetGoal] = useState('AI Engineer');

  // Applied local tracking
  const [appliedScholarships, setAppliedScholarships] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchEduData(token);
  }, [router]);

  const fetchEduData = async (token: string) => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/education/insights', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const insights = await res.json();
        setData(insights);
        setTargetGoal(insights.career_roadmap.goal);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyScholarship = async (schName: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/government/apply', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ scheme_name: schName })
      });
      if (res.ok) {
        alert(`Applied for ${schName} successfully!`);
        setAppliedScholarships(prev => [...prev, schName]);
        if (token) fetchEduData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/education/goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goal_name: targetGoal })
      });
      if (res.ok) {
        setShowGoalModal(false);
        if (token) fetchEduData(token);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateResume = () => {
    setIsGeneratingResume(true);
    setShowResumeModal(true);
    setTimeout(() => {
      setIsGeneratingResume(false);
    }, 1500);
  };

  if (loading || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
      <p className="text-slate-500 font-medium">Drafting Mentorship Roadmaps...</p>
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
                item.name === 'Education' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
              🎓 Education Intelligence
            </h1>
            <p className="mt-2 text-slate-500 font-medium font-sans">
              AI Mentorship, scholarships matcher, study roadmaps, and career development checklists.
            </p>
          </div>
          
          {selectedStudent && (
            <button 
              onClick={handleGenerateResume}
              className="bg-slate-900 hover:bg-slate-800 text-white py-3 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md transition-colors text-sm cursor-pointer"
            >
              <Sparkles className="w-5 h-5 animate-pulse" /> Build AI Resume
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          
          {/* VIEW 1: Student Selection list */}
          {!selectedStudent && (
            <motion.div 
              key="student-list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Warnings/Alerts from Predictive Intelligence */}
              <div className="bg-purple-500/10 border border-purple-250 p-6 rounded-3xl space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-purple-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-purple-600 animate-pulse" /> AI Academic Twin Warnings
                </h3>
                <ul className="space-y-2 text-xs font-semibold text-purple-950">
                  {data.predictions.map((pred: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-1.5 shrink-0" />
                      <span>{pred}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -4, boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}
                  onClick={() => setSelectedStudent(data.summary)}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm cursor-pointer hover:border-slate-300 transition-all flex flex-col justify-between h-56"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">
                      👧
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-brand-green">
                      Readiness: {data.summary.readiness_score}%
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-extrabold text-slate-900 text-xl mt-4">{data.summary.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1">
                      {data.branch} • {data.summary.semester}
                    </p>
                    <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>Goal: {data.career_roadmap.goal}</span>
                      <span className="text-brand-blue">View Profile →</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: Student Dashboard */}
          {selectedStudent && (
            <motion.div 
              key="student-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Back button header */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Students List</span>
                  <h2 className="text-2xl font-bold font-heading text-slate-900">
                    Mentorship Guide: {selectedStudent.name}
                  </h2>
                </div>
              </div>

              {/* Sub tabs navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {[
                  { id: 'academics', name: 'Academics', icon: '📚' },
                  { id: 'scholarships', name: 'Scholarships', icon: '🏆' },
                  { id: 'exams', name: 'Exam Calendar', icon: '📝' },
                  { id: 'career', name: 'AI Career Twin', icon: '🎯' },
                  { id: 'skills', name: 'Skills Meter', icon: '💻' },
                  { id: 'certs', name: 'Certificates List', icon: '📄' },
                  { id: 'internships', name: 'Internships', icon: 'Briefcase' },
                  { id: 'timeline', name: 'Timeline Map', icon: '📅' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.icon === 'Briefcase' ? '💼' : tab.icon}</span>
                    <span>{tab.name}</span>
                  </button>
                ))}
              </div>

              {/* Detailed view display */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                
                {/* 1. Academics (GPAs) */}
                {activeTab === 'academics' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">CGPA Academic Progress</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                      {data.academics.map((ac: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col justify-between h-32">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase">{ac.semester}</span>
                          <div className="text-3xl font-black text-slate-900 mt-2">{ac.gpa}</div>
                          <span className="text-[9px] text-emerald-600 font-bold uppercase mt-2">{ac.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Scholarships Assistant */}
                {activeTab === 'scholarships' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Matched Scholarship Assistance</h3>
                    <div className="space-y-4">
                      {data.scholarships.map((sch: any, idx: number) => {
                        const isDone = appliedScholarships.includes(sch.name);
                        return (
                          <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center gap-4">
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">{sch.name}</h4>
                              <p className="text-xs text-slate-400 font-semibold mt-1">Benefit: {sch.benefit} • Status: {sch.status}</p>
                            </div>

                            {isDone ? (
                              <span className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                                Applied
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApplyScholarship(sch.name)}
                                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-brand-blue transition-colors cursor-pointer"
                              >
                                {sch.action}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. Exam Calendar */}
                {activeTab === 'exams' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Services & Exams Schedules</h3>
                    <div className="divide-y divide-slate-100">
                      {data.exams.map((ex: any, idx: number) => (
                        <div key={idx} className="py-4 flex justify-between items-center gap-4 first:pt-0 last:pb-0 text-sm font-semibold">
                          <div>
                            <h4 className="text-slate-800 font-extrabold leading-tight">{ex.name}</h4>
                            <span className="text-[9px] text-slate-400 uppercase block mt-0.5">{ex.type}</span>
                          </div>
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-xl font-black text-xs">
                            {ex.due_in_days} Days Left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. AI Career Twin */}
                {activeTab === 'career' && (
                  <div className="space-y-8">
                    
                    {/* Progress details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Goal</span>
                          <h4 className="font-heading font-black text-slate-900 text-2xl mt-1">{data.career_roadmap.goal}</h4>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Roadmap Progress</span>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-200 h-3 rounded-full overflow-hidden">
                              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${data.career_roadmap.current_progress}%` }}></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">{data.career_roadmap.current_progress}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-200/60">
                          <span>Placement Readiness Target</span>
                          <span className="text-purple-700 font-bold">{data.career_roadmap.readiness_date}</span>
                        </div>
                        <button 
                          onClick={() => setShowGoalModal(true)}
                          className="w-full mt-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Change Target Goal
                        </button>
                      </div>

                      {/* Next Actions checklist */}
                      <div className="space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Next Recommended Actions</span>
                        <div className="space-y-2">
                          {data.career_roadmap.next_actions.map((act: string, idx: number) => (
                            <div key={idx} className="flex gap-2.5 items-start p-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-700">
                              <Check className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Community statistics */}
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Demographic Benchmarks</span>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {data.community.map((comm: string, idx: number) => (
                          <div key={idx} className="bg-purple-500/5 border border-purple-100 p-4 rounded-2xl text-xs font-semibold text-purple-950 leading-relaxed">
                            {comm}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* 5. Skills Meter */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Competency Skill Matrix</h3>
                    <div className="space-y-4 max-w-xl">
                      {data.skills.map((sk: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{sk.name}</span>
                            <span>{sk.level}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div className="bg-purple-600 h-full rounded-full" style={{ width: `${sk.level}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Certificates List (Vault checks) */}
                {activeTab === 'certs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Vault Certificates check</h3>
                      <Link href="/vault" className="text-xs font-extrabold text-brand-blue hover:underline flex items-center gap-0.5">
                        Open Vault portfolio <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(data.certificates).map(([name, isPresent]: any) => (
                        <div 
                          key={name} 
                          className={`flex justify-between items-center p-4 rounded-2xl border text-xs font-bold ${
                            isPresent ? 'bg-emerald-50/30 border-emerald-100 text-slate-800' : 'bg-red-50/20 border-red-100 text-slate-500'
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
                  </div>
                )}

                {/* 7. Internships */}
                {activeTab === 'internships' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Internship tracker pipeline</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Applied</span>
                        <div className="text-3xl font-black text-slate-800 mt-2">{data.internships.applied}</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Interviews</span>
                        <div className="text-3xl font-black text-brand-blue mt-2">{data.internships.interview}</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Offers</span>
                        <div className="text-3xl font-black text-brand-green mt-2">{data.internships.offer}</div>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                        <span className="text-slate-400 text-xs font-bold block uppercase tracking-wider">Rejected</span>
                        <div className="text-3xl font-black text-brand-red mt-2">{data.internships.rejected}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Timeline Map */}
                {activeTab === 'timeline' && (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Sequence timeline map</h3>
                    <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-6">
                      {data.timeline.map((step: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute left-[-31px] top-1.5 w-4 h-4 bg-purple-600 rounded-full ring-4 ring-purple-100"></span>
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-700">{step.task}</span>
                            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{step.step}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* AI Resume Builder Preview Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-xl w-full p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[85vh]"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                  📁 AI Resume Draft
                </h3>
                <button onClick={() => setShowResumeModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isGeneratingResume ? (
                <div className="py-16 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
                  <h4 className="font-bold text-slate-800">Compiling certifications and projects...</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">NexusOS is gathering CGPA tallies and skills endorsements.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Generated Resume Content */}
                  <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 font-mono text-[10px] text-slate-700 whitespace-pre-wrap leading-relaxed">
{`SARAH KUMAR
Engineering Student | Target: ${targetGoal}
Email: sarah@nexusos.com | Mobile: +91 98765 43210

EDUCATION
Bachelor of Technology in Computer Science
R.G.R. Institute of Technology
CGPA Cumulative: 8.5 (Currentpredicted Sem 4: 8.8)

CORE COMPETENCY SKILLS
• Python Programming (90%)
• SQL & DBMS (70%)
• Machine Learning & Scikit-Learn (65%)
• Data Structures & Algorithms (40%)

PROJECTS
• Predicting Heart Defect Risks (ML, Python, Pandas)
  - Developed random forest model achieving 89% accuracy
• School Admission Portal
  - Full-stack CRUD web utility

CERTIFICATIONS
• 10th Memorandum & 12th Board Certificate (Verified)
• technical Bonafide endorsement`}
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`SARAH KUMAR\nTarget: ${targetGoal}\nCGPA: 8.5\nSkills: Python, SQL, ML`);
                        alert('Resume copied to clipboard!');
                      }}
                      className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-4 h-4" /> Copy Resume
                    </button>
                    <button 
                      onClick={() => {
                        setShowResumeModal(false);
                        alert('Resume exported and compiled as printable file.');
                      }} 
                      className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-850 transition-all text-sm cursor-pointer shadow-md"
                    >
                      Export PDF / Print
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Target Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 30 }} 
              className="bg-white rounded-[24px] max-w-sm w-full p-8 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-slate-900">Target Career Goal</h3>
                <button onClick={() => setShowGoalModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleUpdateGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Career Role</label>
                  <select 
                    value={targetGoal} 
                    onChange={e => setTargetGoal(e.target.value)}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-blue font-semibold text-slate-800 text-sm"
                  >
                    <option value="AI Engineer">AI Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Product Manager">Product Manager</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowGoalModal(false)} 
                    className="flex-1 py-3 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-slate-600 text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center text-sm cursor-pointer shadow-md"
                  >
                    Update Goal
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
