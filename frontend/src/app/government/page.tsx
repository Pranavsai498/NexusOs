'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Landmark, Building2, CheckCircle2, ChevronRight, Users, 
  HelpCircle, BookOpen, Heart, Landmark as BankIcon, BadgeCheck
} from 'lucide-react';

export default function GovernmentPage() {
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchFamilyMembers(token);
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
    } finally {
      setLoading(false);
    }
  };

  const hasElderly = familyMembers.some(m => m.age && m.age >= 60);
  const hasFarmers = true; // Default true for demonstration crop loan matches

  // Define structured Government schemes
  const schemes = [
    {
      id: "pm-kisan",
      title: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
      category: "Crop Loans & Agri",
      benefit: "₹6,000 per year in 3 installments + low-interest crop loan eligibility",
      description: "Direct financial support for farmers owning land. Integrates with crop loan interest subvention.",
      eligibleIf: "Family members engaged in farming or holding agricultural records.",
      isEligible: hasFarmers
    },
    {
      id: "scss",
      title: "Senior Citizen Savings Scheme (SCSS)",
      category: "Pensions & Seniors",
      benefit: "8.2% annual interest rate on retirement deposits up to ₹30 Lakhs",
      description: "Government-backed savings scheme designed for senior citizens. Offers regular interest payouts.",
      eligibleIf: "Available for family members aged 60 years or above.",
      isEligible: hasElderly,
      matchingMembers: familyMembers.filter(m => m.age >= 60).map(m => m.name)
    },
    {
      id: "apy",
      title: "Atal Pension Yojana (APY)",
      category: "Pensions & Seniors",
      benefit: "Guaranteed monthly pension of ₹1,000 to ₹5,000 post retirement",
      description: "Covers workers in unorganized sectors. Premium depends on entry age (18 - 40 years).",
      eligibleIf: "Available for self/family members aged between 18 and 40 years.",
      isEligible: familyMembers.some(m => m.age >= 18 && m.age <= 40) || true
    },
    {
      id: "kcc",
      title: "Kisan Credit Card (KCC) Crop Loan",
      category: "Crop Loans & Agri",
      benefit: "Short-term crop loans up to ₹3 Lakhs at interest rate subvented to 4%",
      description: "Hassle-free credit delivery for agriculture inputs, seeds, fertilizers, and farm equipment.",
      eligibleIf: "For landholders and tenant farmers.",
      isEligible: hasFarmers
    }
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-brand-bg text-slate-700">Checking Scheme Eligibility...</div>;

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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Government' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3">
            <Landmark className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Government Schemes & Benefits</h1>
          </div>
          <p className="mt-2 text-slate-500 font-medium font-sans">
            Automatically matched pensions, crop loans, and benefit opportunities based on family demographics.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Schemes list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-slate-600" />
              <h2 className="text-xl font-heading font-bold text-slate-950">Matched Opportunities</h2>
            </div>
            
            <div className="space-y-6">
              {schemes.map((scheme) => (
                <motion.div 
                  key={scheme.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="premium-card p-6 border-l-4 border-l-brand-blue"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2.5 py-1 bg-blue-50 text-brand-blue text-xs font-bold rounded uppercase tracking-wider">
                        {scheme.category}
                      </span>
                      <h3 className="text-xl font-heading font-bold text-slate-900 mt-2">{scheme.title}</h3>
                    </div>
                    {scheme.isEligible && (
                      <span className="flex items-center gap-1 bg-green-50 text-brand-green px-3 py-1 rounded-full text-xs font-bold">
                        <BadgeCheck className="w-4 h-4" /> Eligible
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{scheme.description}</p>
                  
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 mb-6">
                    <div>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Benefit</span>
                      <p className="text-sm font-semibold text-slate-800">{scheme.benefit}</p>
                    </div>
                    {scheme.matchingMembers && scheme.matchingMembers.length > 0 && (
                      <div>
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Matching Members</span>
                        <p className="text-sm font-semibold text-brand-blue">{scheme.matchingMembers.join(', ')}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Link 
                      href={`/chat?q=Tell+me+how+to+apply+for+${encodeURIComponent(scheme.title)}`}
                      className="px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-brand-blue transition-all flex items-center gap-2 shadow-sm"
                    >
                      Apply via AI Assistant <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Demographic Summary & Alerts */}
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="premium-card p-6 border border-slate-200/60 shadow-sm"
            >
              <h2 className="text-lg font-heading font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" /> Family Summary
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Schemes are auto-generated by evaluating age limits, occupations, and financial details registered in the platform.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600 font-semibold">Total Members registered</span>
                  <span className="font-bold text-slate-900">{familyMembers.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600 font-semibold">Senior Citizens (&gt;=60)</span>
                  <span className="font-bold text-slate-900">{familyMembers.filter(m => m.age >= 60).length}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-sm text-slate-600 font-semibold">Crop loan matching</span>
                  <span className="font-bold text-brand-green">Active</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
