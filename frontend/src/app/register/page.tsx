'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register User
      const registerRes = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: name,
          phone_number: phone || null 
        }),
      });
      
      const registerData = await registerRes.json();
      
      if (!registerRes.ok) {
        setError(registerData.detail || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // 2. Auto-login User
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const loginRes = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        localStorage.setItem('token', loginData.access_token);
        router.push('/dashboard');
      } else {
        // Fallback to login page if auto-login fails
        router.push('/login');
      }
    } catch (err) {
      setError('Unable to reach the server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-slate-900 rounded-xl mx-auto flex items-center justify-center text-white font-heading font-bold text-2xl shadow-lg mb-4">N</div>
          <h2 className="text-3xl font-bold text-slate-900 font-heading">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-500">Join NexusOS and manage your family's life</p>
        </div>
        
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" placeholder="John Doe" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (Optional)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" placeholder="+1 (555) 000-0000" disabled={isLoading} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" placeholder="you@example.com" disabled={isLoading} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" placeholder="••••••••" disabled={isLoading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password *</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all" placeholder="••••••••" disabled={isLoading} />
            </div>
          </div>
          
          <div className="flex items-start pt-2">
            <div className="flex items-center h-5">
              <input id="terms" type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-4 h-4 text-brand-blue border-gray-300 rounded focus:ring-brand-blue" disabled={isLoading} />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-slate-700">I accept the Terms and Conditions</label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="w-full px-4 py-3 mt-4 text-white bg-slate-900 rounded-xl hover:bg-brand-blue font-semibold shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70">
            {isLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating account...</>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-600 pt-2">
          Already have an account? <Link href="/login" className="text-brand-blue font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
