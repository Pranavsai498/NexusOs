'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const publicRoutes = ['/', '/login', '/register'];
    
    if (!token) {
      if (!publicRoutes.includes(pathname)) {
        router.replace('/login');
      } else {
        setIsAuthenticated(true);
      }
    } else {
      if (publicRoutes.includes(pathname)) {
        router.replace('/dashboard');
      } else {
        setIsAuthenticated(true);
      }
    }
  }, [pathname, router]);

  // Show nothing or a global loader while checking auth
  if (isAuthenticated === null) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-slate-500">Verifying session...</div>;
  }

  return <>{children}</>;
}
