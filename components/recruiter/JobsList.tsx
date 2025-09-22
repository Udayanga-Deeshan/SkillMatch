"use client";

import React from 'react';
import { useAtom } from 'jotai';
import {
  filteredJobsAtom,
  jobsLoadingAtom,
  jobsErrorAtom,
  jobFormOpenAtom,
  jobEditModeAtom,
  selectedJobAtom,
  deleteJobAtom,
  Job,
} from '../../atoms/jobAtom';
import JobCard from './JobCard';

interface JobsListProps {
  onViewApplications?: (jobId: string, jobTitle: string) => void;
}

export default function JobsList({ onViewApplications }: JobsListProps) {
  const [jobs] = useAtom(filteredJobsAtom);
  const [isLoading] = useAtom(jobsLoadingAtom);
  const [error] = useAtom(jobsErrorAtom);
  const [, setJobFormOpen] = useAtom(jobFormOpenAtom);
  const [, setJobEditMode] = useAtom(jobEditModeAtom);
  const [, setSelectedJob] = useAtom(selectedJobAtom);
  const [, deleteJob] = useAtom(deleteJobAtom);

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setJobEditMode(true);
    setJobFormOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      await deleteJob(jobId);
    }
  };

  const handleViewApplications = (job: Job) => {
    if (onViewApplications) {
      onViewApplications(job.id, job.title);
    } else {
      // Fallback for when used without the prop
      alert('Applications view will be implemented in the next phase.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="flex gap-4 mb-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              <div className="h-4 bg-gray-200 rounded w-3/5"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading jobs</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600 mb-6">
          You haven't posted any jobs yet, or no jobs match your current filters.
        </p>
        <button
          onClick={() => {
            setSelectedJob(null);
            setJobEditMode(false);
            setJobFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onEdit={handleEditJob}
          onDelete={handleDeleteJob}
          onViewApplications={handleViewApplications}
        />
      ))}
    </div>
  );
}