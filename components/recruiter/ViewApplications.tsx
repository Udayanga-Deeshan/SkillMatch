"use client";

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '../../atoms/authAtom';
import {
  applicationStatsAtom,
  applicationsLoadingAtom,
  applicationsErrorAtom,
  fetchApplicationsAtom,
  updateApplicationStatusAtom,
  applicationStatusFilterAtom,
  applicationSearchTermAtom,
  applicationJobFilterAtom,
  computedFilteredApplicationsAtom,
  refreshApplicationsAtom,
  ApplicationStatus,
  Application
} from '../../atoms/applicationAtom';

// Application Details Modal Component
function ApplicationDetailsModal({ application, onClose, onUpdateStatus }: {
  application: Application | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
}) {
  if (!application) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'HIRED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Application Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Application Info */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Candidate Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.candidate.name}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Email:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.candidate.email}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Job Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Position:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.job.title}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Location:</span>
                    <span className="ml-2 text-sm text-gray-900">{application.job.location}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Application Status</h4>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Applied on {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Update Actions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Update Status</h4>
              <div className="flex space-x-2 flex-wrap">
                {application.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(application.id, 'SHORTLISTED');
                        onClose();
                      }}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(application.id, 'REJECTED');
                        onClose();
                      }}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {application.status === 'SHORTLISTED' && (
                  <>
                    <button
                      onClick={() => {
                        onUpdateStatus(application.id, 'HIRED');
                        onClose();
                      }}
                      className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Hire
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(application.id, 'REJECTED');
                        onClose();
                      }}
                      className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
                {(application.status === 'REJECTED' || application.status === 'HIRED') && (
                  <button
                    onClick={() => {
                      onUpdateStatus(application.id, 'PENDING');
                      onClose();
                    }}
                    className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ViewApplicationsProps {
  selectedJobTitle?: string;
  onBackToAllApplications?: () => void;
}

export default function ViewApplications({ selectedJobTitle, onBackToAllApplications }: ViewApplicationsProps) {
  const [user] = useAtom(authAtom);
  const [stats] = useAtom(applicationStatsAtom);
  const [loading] = useAtom(applicationsLoadingAtom);
  const [error] = useAtom(applicationsErrorAtom);
  const [filteredApplications] = useAtom(computedFilteredApplicationsAtom);
  const [filterStatus, setFilterStatus] = useAtom(applicationStatusFilterAtom);
  const [searchTerm, setSearchTerm] = useAtom(applicationSearchTermAtom);
  const [jobFilter] = useAtom(applicationJobFilterAtom);
  const [refreshTrigger] = useAtom(refreshApplicationsAtom);
  
  const [, fetchApplications] = useAtom(fetchApplicationsAtom);
  const [, updateApplicationStatus] = useAtom(updateApplicationStatusAtom);
  
  // Local state for enhanced features
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (user?.role === 'RECRUITER') {
      fetchApplications();
    }
  }, [user, fetchApplications, refreshTrigger]);

  const handleUpdateStatus = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus({ applicationId, status: newStatus });
    } catch (err) {
      // Error is already handled in the atom
      console.error('Failed to update status:', err);
    }
  };

  const handleBulkUpdateStatus = async (newStatus: ApplicationStatus) => {
    try {
      const promises = selectedApplicationIds.map(id => 
        updateApplicationStatus({ applicationId: id, status: newStatus })
      );
      await Promise.all(promises);
      setSelectedApplicationIds([]);
      setShowBulkActions(false);
    } catch (err) {
      console.error('Failed to bulk update status:', err);
    }
  };

  const handleSelectAll = () => {
    if (selectedApplicationIds.length === filteredApplications.length) {
      setSelectedApplicationIds([]);
    } else {
      setSelectedApplicationIds(filteredApplications.map(app => app.id));
    }
  };

  const handleSelectApplication = (applicationId: string) => {
    setSelectedApplicationIds(prev => 
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const exportToCSV = () => {
    const headers = ['Candidate Name', 'Email', 'Job Title', 'Location', 'Status', 'Applied Date'];
    const csvData = filteredApplications.map(app => [
      app.candidate.name,
      app.candidate.email,
      app.job.title,
      app.job.location,
      app.status,
      new Date(app.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applications-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'HIRED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Filter Header */}
      {selectedJobTitle && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">
                  Viewing applications for: {selectedJobTitle}
                </h3>
                <p className="text-sm text-blue-700">
                  Showing only applications for this specific job position
                </p>
              </div>
            </div>
            {onBackToAllApplications && (
              <button
                onClick={onBackToAllApplications}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                View All Applications
              </button>
            )}
          </div>
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Shortlisted</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.shortlistedApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.rejectedApplications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Hired</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.hiredApplications}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="REJECTED">Rejected</option>
                <option value="HIRED">Hired</option>
              </select>
            </div>

            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates or jobs..."
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            
            {selectedApplicationIds.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Bulk Actions ({selectedApplicationIds.length})
              </button>
            )}
            
            <div className="text-sm text-gray-500">
              Showing {filteredApplications.length} applications
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedApplicationIds.length > 0 && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-900">
                {selectedApplicationIds.length} application{selectedApplicationIds.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkUpdateStatus('SHORTLISTED')}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Shortlist All
                </button>
                <button
                  onClick={() => handleBulkUpdateStatus('REJECTED')}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject All
                </button>
                <button
                  onClick={() => {
                    setSelectedApplicationIds([]);
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900 mb-2">No applications found</p>
            <p>Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedApplicationIds.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedApplicationIds.includes(application.id)}
                        onChange={() => handleSelectApplication(application.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidate.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.candidate.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.job.title}</div>
                      <div className="text-sm text-gray-500">{application.job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-indigo-600 hover:text-indigo-900 px-2 py-1 text-xs bg-indigo-50 rounded"
                        >
                          View Details
                        </button>
                        {application.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'SHORTLISTED')}
                              className="text-blue-600 hover:text-blue-900 px-2 py-1 text-xs bg-blue-50 rounded"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-50 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'SHORTLISTED' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'HIRED')}
                              className="text-green-600 hover:text-green-900 px-2 py-1 text-xs bg-green-50 rounded"
                            >
                              Hire
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'REJECTED')}
                              className="text-red-600 hover:text-red-900 px-2 py-1 text-xs bg-red-50 rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(application.status === 'REJECTED' || application.status === 'HIRED') && (
                          <button
                            onClick={() => handleUpdateStatus(application.id, 'PENDING')}
                            className="text-gray-600 hover:text-gray-900 px-2 py-1 text-xs bg-gray-50 rounded"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}