'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Shield, Calendar, Activity, 
  Lock, Save, LogOut, CheckCircle, AlertCircle, Loader2, Sparkles, ArrowLeft
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit Profile form state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('Owner');
  const [avatarSeed, setAvatarSeed] = useState('User');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Change Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setRole(data.role || 'Owner');
        setAvatarSeed(data.avatar || data.full_name?.split(' ')[0] || 'User');
      } else {
        setError('Failed to fetch profile details.');
      }
    } catch (e) {
      setError('Could not connect to the API server.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSavingProfile(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber || null,
          avatar: avatarSeed,
          role: role,
          preferences: profile?.preferences || {}
        })
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        fetchProfile(); // reload
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to update profile.');
      }
    } catch (err) {
      setError('Connection failed. Please check your network.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setIsSavingPassword(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:8000/api/v1/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (res.ok) {
        setPasswordSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setPasswordError(data.detail || 'Failed to change password.');
      }
    } catch (err) {
      setPasswordError('Connection failed.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('token');
    router.push('/login');
  };

  const getAvatarUrl = () => {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}`;
  };

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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Settings' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight">Account Profile</h1>
            <p className="mt-1 text-slate-500 font-medium">Configure details, adjust settings, and secure your credentials.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-semibold transition shadow-sm text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-brand-blue mb-4" />
            <p className="font-medium">Fetching profile details from MongoDB...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Summary Card */}
            <div className="xl:col-span-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card p-6 text-center flex flex-col items-center"
              >
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-purple-500 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
                  <img 
                    src={getAvatarUrl()} 
                    alt={fullName} 
                    className="relative w-32 h-32 rounded-full border-4 border-white shadow-xl bg-slate-50"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full border-2 border-white shadow-md">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                <h2 className="text-2xl font-heading font-bold text-slate-900">{profile?.full_name}</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">{profile?.email}</p>
                
                <span className="inline-block mt-4 px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                  {profile?.role || 'Owner'}
                </span>

                <div className="w-full border-t border-slate-100 my-6 pt-6 space-y-4 text-left">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Phone className="w-4 h-4" /> Phone</span>
                    <span className="font-semibold text-slate-900">{profile?.phone_number || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Shield className="w-4 h-4" /> Family ID</span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border truncate max-w-[150px]" title={profile?.family_id || 'unlinked'}>
                      {profile?.family_id || 'unlinked'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Calendar className="w-4 h-4" /> Joined</span>
                    <span className="font-semibold text-slate-900">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-slate-500"><Activity className="w-4 h-4" /> Status</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Editing Pane */}
            <div className="xl:col-span-2 space-y-8">
              {/* Profile Details Form */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card p-8"
              >
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-brand-blue" /> Personal Details
                </h3>

                {success && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-5 h-5" /> {success}
                  </div>
                )}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" /> {error}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Family Role</label>
                      <select 
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all bg-white"
                      >
                        <option value="Owner">Primary Owner / Admin</option>
                        <option value="Parent">Parent</option>
                        <option value="Spouse">Spouse / Partner</option>
                        <option value="Child">Child</option>
                        <option value="Grandparent">Grandparent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Avatar Seed (Notionists style)</label>
                      <input 
                        type="text" 
                        value={avatarSeed}
                        onChange={e => setAvatarSeed(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="e.g. Charlie"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Updates the character graphic dynamically based on the input text.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSavingProfile}
                      className="px-6 py-3 bg-slate-900 text-white hover:bg-brand-blue rounded-xl font-semibold shadow-md flex items-center gap-2 transition disabled:opacity-75"
                    >
                      {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Profile
                    </button>
                  </div>
                </form>
              </motion.div>

              {/* Password Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="premium-card p-8"
              >
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-brand-blue" /> Security & Password
                </h3>

                {passwordSuccess && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-2 text-sm font-medium">
                    <CheckCircle className="w-5 h-5" /> {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center gap-2 text-sm font-medium">
                    <AlertCircle className="w-5 h-5" /> {passwordError}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                    <input 
                      type="password" 
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button 
                      type="submit" 
                      disabled={isSavingPassword}
                      className="px-6 py-3 bg-slate-900 text-white hover:bg-brand-blue rounded-xl font-semibold shadow-md flex items-center gap-2 transition disabled:opacity-75"
                    >
                      {isSavingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                      Update Password
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
