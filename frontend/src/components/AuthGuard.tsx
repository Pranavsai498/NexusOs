'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, CheckCircle, ShieldAlert, Sparkles, Loader2 } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [pinVerified, setPinVerified] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [loadingContext, setLoadingContext] = useState<boolean>(false);
  const [welcomeBack, setWelcomeBack] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isSessionVerified = sessionStorage.getItem('pin_verified') === 'true';
    const publicRoutes = ['/', '/login', '/register'];
    
    if (!token) {
      if (!publicRoutes.includes(pathname)) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
        setPinVerified(true);
      }
    } else {
      if (publicRoutes.includes(pathname)) {
        router.replace('/dashboard');
      } else {
        setIsAuthenticated(true);
        setPinVerified(isSessionVerified);
      }
    }
  }, [pathname, router]);

  // Handle key press on physical keyboard
  useEffect(() => {
    if (isAuthenticated && !pinVerified) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key >= '0' && e.key <= '9') {
          if (pin.length < 4) handleNumPress(e.key);
        } else if (e.key === 'Backspace') {
          handleDelete();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isAuthenticated, pinVerified, pin]);

  const handleNumPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        // Trigger auto submit
        verifyPinCode(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const verifyPinCode = async (pinValue: string) => {
    setIsValidating(true);
    setError('');
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/verify-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin: pinValue })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Successful verification! Show loading animations
        setIsValidating(false);
        setLoadingContext(true);
        
        // Simulating step 1 loading family context
        setTimeout(() => {
          setLoadingContext(false);
          setWelcomeBack(true);
          
          setTimeout(() => {
            sessionStorage.setItem('pin_verified', 'true');
            setPinVerified(true);
          }, 1200);
        }, 1500);
      } else {
        setError(data.detail || 'Incorrect PIN. Please try again.');
        setPin('');
        setIsValidating(false);
      }
    } catch (e) {
      setError('Unable to connect to security server.');
      setPin('');
      setIsValidating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('pin_verified');
    window.location.href = '/login';
  };

  // Show nothing or a global loader while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-blue mb-4" />
        <p className="text-slate-500 font-medium font-sans">Verifying security token...</p>
      </div>
    );
  }

  // If authenticated but pin is not verified, show PIN unlock screen
  if (isAuthenticated && !pinVerified) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Futuristic glowing blobs */}
        <div className="absolute top-[-20%] left-[-20%] w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[35rem] h-[35rem] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <AnimatePresence mode="wait">
          {/* Main PIN Entry Panel */}
          {!loadingContext && !welcomeBack && (
            <motion.div 
              key="pin-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-inner mb-6">
                <Lock className="w-8 h-8 text-blue-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white font-heading text-center">Enter Security PIN</h2>
              <p className="text-slate-400 text-sm mt-2 text-center">Unlock your secure family vault space (Default PIN: 1234)</p>
              
              {/* PIN Code Circles */}
              <div className="flex gap-4 my-8">
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={index}
                    className={`w-4 h-4 rounded-full border-2 border-white/30 transition-all duration-200 ${
                      pin.length > index ? 'bg-blue-400 border-blue-400 scale-125 shadow-[0_0_12px_#3b82f6]' : ''
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="text-red-400 text-sm font-semibold mb-6 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> {error}
                </div>
              )}

              {/* Grid Keypad */}
              <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumPress(num)}
                    disabled={isValidating}
                    className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-heading font-semibold text-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {num}
                  </button>
                ))}
                
                {/* Clear/Delete */}
                <button
                  onClick={handleDelete}
                  disabled={isValidating}
                  className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 font-medium transition-all flex items-center justify-center disabled:opacity-50 active:scale-95"
                >
                  Delete
                </button>
                
                {/* 0 */}
                <button
                  onClick={() => handleNumPress('0')}
                  disabled={isValidating}
                  className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-heading font-semibold text-xl border border-white/5 hover:border-white/10 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  0
                </button>
                
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="h-16 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all flex items-center justify-center active:scale-95"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading Context State */}
          {loadingContext && (
            <motion.div 
              key="loading-context"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="relative mb-6">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-bold text-white font-heading">Loading Family Context...</h2>
              <p className="text-slate-400 text-sm mt-2">Syncing vault documents, insurance, and medical alerts.</p>
            </motion.div>
          )}

          {/* Welcome Back State */}
          {welcomeBack && (
            <motion.div 
              key="welcome-back"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div 
                initial={{ rotate: -90, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_#10b981]"
              >
                <CheckCircle className="w-12 h-12" />
              </motion.div>
              <h2 className="text-4xl font-extrabold text-white font-heading">Welcome Back</h2>
              <p className="text-slate-300 text-lg mt-2 font-medium">Family OS is ready.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <>{children}</>;
}

