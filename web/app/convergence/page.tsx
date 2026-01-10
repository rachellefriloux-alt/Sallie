'use client';

/**
 * The Great Convergence - 30 Questions Page
 * Canonical Spec Section 14.3
 * 
 * Main entry point for the psychological excavation experience
 */

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import GreatConvergence30 to avoid SSR issues with Speech API
const GreatConvergence30 = dynamic(
  () => import('@/components/GreatConvergence30'),
  { ssr: false }
);

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-violet-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Preparing The Great Convergence...</p>
        <p className="text-gray-400 text-sm mt-2">Loading your journey</p>
      </div>
    </div>
  );
}

export default function ConvergencePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GreatConvergence30 />
    </Suspense>
  );
}

