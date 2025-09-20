"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import {
  jobsAtom,
  jobsStatsAtom,
  jobsLoadingAtom,
  jobsErrorAtom,
  fetchJobsAtom,
} from '../../../atoms/jobAtom';
import Navbar from '../../../components/Navbar';
import DashboardStats from '../../../components/recruiter/DashboardStats';
import JobFilters from '../../../components/recruiter/JobFilters';
import JobsList from '../../../components/recruiter/JobsList';
import JobForm from '../../../components/recruiter/JobForm';
import ViewApplications from '../../../components/recruiter/ViewApplications';
import ErrorBoundary from '../../../components/ErrorBoundary';

function RecruiterDashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs] = useAtom(jobsAtom);
  const [stats] = useAtom(jobsStatsAtom);
  const [isLoading] = useAtom(jobsLoadingAtom);
  const [error] = useAtom(jobsErrorAtom);
  const [, fetchJobs] = useAtom(fetchJobsAtom);
  const [activeTab, setActiveTab] = useState('jobs');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    const user = session.user as any;
    if (user.role !== 'RECRUITER') {
      router.push('/unauthorized');
      return;
    }

    // Fetch jobs on component mount
    fetchJobs();
  }, [session, status, router, fetchJobs]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user as any;
  if (user.role !== 'RECRUITER') return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <Navbar />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name?.split(' ')[0] || 'Recruiter'}!
          </h1>
          <p className="text-gray-600">
            Manage your job postings and track applications from your dashboard.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Job Management
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Application Management
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && (
          <>
            {/* Stats */}
            <DashboardStats stats={stats} isLoading={isLoading} />

            {/* Filters */}
            <JobFilters />

            {/* Jobs List */}
            <JobsList />

            {/* Job Form Modal */}
            <JobForm />
          </>
        )}

        {activeTab === 'applications' && (
          <ViewApplications />
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruiterDashboardPage() {
  return (
    <ErrorBoundary>
      <RecruiterDashboardContent />
    </ErrorBoundary>
  );
}