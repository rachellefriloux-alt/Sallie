'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dashboard } from '@/components/Dashboard';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [needsConvergence, setNeedsConvergence] = useState(false);

  useEffect(() => {
    checkConvergenceStatus();
  }, []);

  const checkConvergenceStatus = async () => {
    try {
      // Check if heritage/core.json exists (indicates convergence completed)
      const response = await fetch(`${API_BASE}/convergence/status`);
      
      if (response.status === 503) {
        // System not ready, show dashboard anyway
        setChecking(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        if (data.completed) {
          // Convergence completed, show dashboard
          setNeedsConvergence(false);
        } else {
          // Convergence not completed, redirect to onboarding
          setNeedsConvergence(true);
          router.push('/convergence');
        }
      } else {
        // Assume needs convergence if status check fails
        setNeedsConvergence(true);
        router.push('/convergence');
      }
    } catch (err) {
      console.error('Failed to check convergence status:', err);
      // On error, check if heritage exists by trying to access it
      // For now, assume needs convergence
      setNeedsConvergence(true);
      router.push('/convergence');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking system status...</p>
        </div>
      </div>
    );
  }

  if (needsConvergence) {
    return null; // Router will handle redirect
  }

  return <Dashboard />;
}

