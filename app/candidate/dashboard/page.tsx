"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  candidateJobsAtom,
  candidateApplicationsAtom,
  candidateStatsAtom,
  fetchCandidateDataAtom,
} from '../../../atoms/candidateAtom';
import Navbar from '../../../components/Navbar';
import CandidateDashboard from '../../../components/candidate/CandidateDashboard';

export default function CandidateDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [, fetchCandidateData] = useAtom(fetchCandidateDataAtom);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    const user = session.user as any;
    if (user.role !== 'CANDIDATE') {
      router.push('/unauthorized');
      return;
    }

    // Initialize candidate data
    fetchCandidateData();
  }, [session, status, router, fetchCandidateData]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as any;
  if (user.role !== 'CANDIDATE') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <Navbar />
        <CandidateDashboard />
      </div>
    </div>
  );
}
