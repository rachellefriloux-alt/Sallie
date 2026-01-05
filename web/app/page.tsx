'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SallieStudio } from '@/components/SallieStudio';
import { FirstRunWizard } from '@/components/FirstRunWizard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.47:8742';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [showFirstRun, setShowFirstRun] = useState(false);

  useEffect(() => {
    // Only check once on mount
    let mounted = true;
    
    // Check if first run flag exists in localStorage
    const hasCompletedFirstRun = localStorage.getItem('sallie_first_run_completed');
    
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
        
        // Show first run wizard if not completed before
        if (!hasCompletedFirstRun) {
          setShowFirstRun(true);
        }
        
        // For any other case (503, error, completed), show dashboard
        setChecking(false);
      } catch (error) {
        // On connection error, show first run wizard to help user troubleshoot
        console.warn(
          'Backend connection check failed:',
          error instanceof Error ? error.message : String(error)
        );
        if (mounted) {
          if (!hasCompletedFirstRun) {
            setShowFirstRun(true);
          }
          setChecking(false);
        }
      }
    };

    checkConvergenceStatus();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleFirstRunComplete = () => {
    localStorage.setItem('sallie_first_run_completed', 'true');
    setShowFirstRun(false);
  };

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

  if (showFirstRun) {
    return <FirstRunWizard onComplete={handleFirstRunComplete} />;
  }

  return <SallieStudio />;
}
