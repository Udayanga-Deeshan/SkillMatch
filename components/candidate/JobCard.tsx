"use client";

import React from 'react';
import { useAtom } from 'jotai';
import {
  JobForCandidate,
  applyToJobAtom,
  applicationLoadingAtom,
  appliedJobIdsAtom,
  savedJobIdsAtom,
  toggleSaveJobAtom,
  selectedJobAtom,
  jobDetailsModalOpenAtom,
} from '../../atoms/candidateAtom';
import { JOB_CATEGORIES } from '../../atoms/jobAtom';

interface JobCardProps {
  job: JobForCandidate;
}

export default function JobCard({ job }: JobCardProps) {
  const [, applyToJob] = useAtom(applyToJobAtom);
  const [applicationLoading] = useAtom(applicationLoadingAtom);
  const [appliedJobIds] = useAtom(appliedJobIdsAtom);
  const [savedJobIds] = useAtom(savedJobIdsAtom);
  const [, toggleSaveJob] = useAtom(toggleSaveJobAtom);
  const [, setSelectedJob] = useAtom(selectedJobAtom);
  const [, setJobDetailsModalOpen] = useAtom(jobDetailsModalOpenAtom);

  const isApplied = appliedJobIds.includes(job.id);
  const isSaved = savedJobIds.includes(job.id);
  const isApplying = applicationLoading === job.id;

  const handleApply = async () => {
    if (isApplied || isApplying) return;
    
    try {
      await applyToJob(job.id);
    } catch (error) {
      // Error is handled in the atom
    }
  };

  const handleSave = () => {
    toggleSaveJob(job.id);
  };

  const handleViewDetails = () => {
    setSelectedJob(job);
    setJobDetailsModalOpen(true);
  };

  const formatSalary = (salary: number | null) => {
    if (!salary) return 'Salary not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 cursor-pointer transition-colors"
              onClick={handleViewDetails}>
            {job.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
              </svg>
              {job.company || 'Company'}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              {formatSalary(job.salary)}
            </div>
          </div>
          
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {JOB_CATEGORIES[job.category]}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors ${
              isSaved 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save job'}
          >
            <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Job Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            Posted {formatDate(job.createdAt)}
          </span>
          {job._count?.applications && (
            <span className="text-xs text-gray-500">
              {job._count.applications} applicant{job._count.applications !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewDetails}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View Details
          </button>
          <button
            onClick={handleApply}
            disabled={isApplied || isApplying}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isApplied
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : isApplying
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isApplied ? (
              <>
                <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Applied
              </>
            ) : isApplying ? (
              <>
                <svg className="w-4 h-4 inline mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Applying...
              </>
            ) : (
              'Apply Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}