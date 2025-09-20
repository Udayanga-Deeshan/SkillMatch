"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  dashboardViewAtom,
  fetchCandidateDataAtom,
  candidateStatsAtom,
  candidateJobsLoadingAtom,
  applicationErrorAtom,
} from '../../atoms/candidateAtom';
import CandidateStatsCards from './CandidateStatsCards';
import CandidateJobFilters from './CandidateJobFilters';
import JobsList from './JobsList';
import ApplicationsList from './ApplicationsList';
import JobDetailsModal from './JobDetailsModal';
import ErrorBoundary from '../ErrorBoundary';

function CandidateDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView] = useAtom(dashboardViewAtom);
  const [stats] = useAtom(candidateStatsAtom);
  const [isLoading] = useAtom(candidateJobsLoadingAtom);
  const [error] = useAtom(applicationErrorAtom);
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

    // Fetch candidate data on component mount
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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'applications':
        return <ApplicationsList />;
      case 'jobs':
      default:
        return <JobsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Candidate'}!
          </h1>
          <p className="text-gray-600">
            Discover your next career opportunity and track your applications.
          </p>
        </div>

        {/* Stats Cards */}
        <CandidateStatsCards stats={stats} isLoading={isLoading} />

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <TabButton 
                view="jobs" 
                currentView={currentView} 
                label="Browse Jobs"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                  </svg>
                }
              />
              <TabButton 
                view="applications" 
                currentView={currentView} 
                label="My Applications"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                badge={stats.totalApplications > 0 ? stats.totalApplications : undefined}
              />
            </nav>
          </div>
        </div>

        {/* Filters (only show for jobs view) */}
        {currentView === 'jobs' && <CandidateJobFilters />}

        {/* Main Content */}
        <div className="mb-8">
          {renderCurrentView()}
        </div>

        {/* Job Details Modal */}
        <JobDetailsModal />

        {/* Error Toast */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  view: 'jobs' | 'applications';
  currentView: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

function TabButton({ view, currentView, label, icon, badge }: TabButtonProps) {
  const [, setView] = useAtom(dashboardViewAtom);
  const isActive = currentView === view;

  return (
    <button
      onClick={() => setView(view)}
      className={`${
        isActive
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
    >
      {icon}
      {label}
      {badge && badge > 0 && (
        <span className="bg-indigo-100 text-indigo-600 text-xs rounded-full px-2 py-0.5 ml-1">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function CandidateDashboard() {
  return (
    <ErrorBoundary>
      <CandidateDashboardContent />
    </ErrorBoundary>
  );
}