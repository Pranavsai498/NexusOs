'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Bell, BellRing, Info, AlertTriangle, AlertCircle, Calendar, 
  CreditCard, ShieldAlert, Award, ArrowLeft, Loader2
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      } else {
        setError('Failed to load notifications.');
      }
    } catch (e) {
      setError('Could not connect to API server.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-l-4 border-l-red-500 bg-red-50/30',
          iconColor: 'text-red-500',
          badge: 'bg-red-100 text-red-700'
        };
      case 'warning':
        return {
          border: 'border-l-4 border-l-amber-500 bg-amber-50/20',
          iconColor: 'text-amber-500',
          badge: 'bg-amber-100 text-amber-700'
        };
      default:
        return {
          border: 'border-l-4 border-l-blue-500 bg-blue-50/10',
          iconColor: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-700'
        };
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <ShieldAlert className="w-6 h-6" />;
    
    switch (type) {
      case 'bill':
        return <CreditCard className="w-6 h-6" />;
      case 'warranty':
        return <Award className="w-6 h-6" />;
      default:
        return <Info className="w-6 h-6" />;
    }
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
            <Link key={item} href={`/${item.toLowerCase()}`} className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${item === 'Dashboard' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <div className="w-5 h-5 rounded-md bg-current opacity-70"></div>
              <span className="hidden md:block font-medium">{item}</span>
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 sm:ml-20 md:ml-64 p-4 md:p-10 pb-32">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link href="/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </Link>
            </div>
            <h1 className="text-4xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Bell className="w-8 h-8 text-slate-800" /> Notifications
            </h1>
            <p className="mt-1 text-slate-500 font-medium">Keep track of upcoming premiums, bill deadlines, and warranty expiries.</p>
          </div>
          <button 
            onClick={fetchNotifications}
            className="btn-secondary text-sm px-4 py-2"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
            <p className="font-medium text-sm">Aggregating real-time alerts...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-2 font-medium">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="premium-card p-12 text-center text-slate-500">
            <BellRing className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-heading font-bold text-lg text-slate-700">All clear!</h3>
            <p className="text-sm text-slate-500 mt-1">No upcoming bill deadlines or warranty expiries recorded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, idx) => {
              const styles = getSeverityStyles(notif.severity);
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`premium-card p-5 flex gap-4 items-start shadow-sm border border-slate-100 ${styles.border}`}
                >
                  <div className={`p-2.5 rounded-xl bg-white border shadow-sm ${styles.iconColor}`}>
                    {getNotificationIcon(notif.type, notif.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-heading font-bold text-slate-900 text-lg leading-snug">{notif.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1 leading-relaxed">{notif.message}</p>
                    <div className="mt-4 flex gap-3">
                      {notif.type === 'bill' && (
                        <Link href="/finance" className="text-xs font-semibold text-brand-blue hover:underline">
                          View Bills &rarr;
                        </Link>
                      )}
                      {notif.type === 'warranty' && (
                        <Link href="/warranty" className="text-xs font-semibold text-brand-blue hover:underline">
                          View Warranties &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
