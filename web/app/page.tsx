'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only check once on mount
    let mounted = true;
    
    const checkConvergenceStatus = async () => {
      try {
        // Give the backend a moment to respond
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${API_BASE}/convergence/status`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!mounted) return;
        
        if (response.ok) {
          const data = await response.json();
          if (!data.completed) {
            // Only redirect if convergence is definitely not completed
            setRedirecting(true);
            router.push('/convergence');
            return;
          }
        }
        // For any other case (503, error, completed), show dashboard
        setChecking(false);
      } catch (err) {
        // On connection error, show dashboard with connection warning
        // This allows the UI to load even if backend is temporarily down
        console.warn('Backend connection check failed:', err.message);
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkConvergenceStatus();
    
    return () => {
      mounted = false;
    };
  }, [router]);

  if (checking || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400">
            {redirecting ? 'Redirecting to setup...' : 'Loading Sallie...'}
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

