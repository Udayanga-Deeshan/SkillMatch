"use client";

import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';

type JobForClient = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  recruiter: { id: string; name: string } | null;
};

export default function CandidateDashboardClient({ jobs, appliedJobIds }: { jobs: JobForClient[]; appliedJobIds?: string[] }) {
  const [auth] = useAtom(authAtom);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!auth || auth.role !== 'CANDIDATE') {
    return <div className="p-6 bg-yellow-50 rounded">This area is for candidates only. Please sign in as a candidate.</div>;
  }

  async function apply(jobId: string) {
    setLoadingId(jobId);
    setMessage(null);
    try {
      const res = await fetch('/api/apply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setMessage('Application submitted');
    } catch (err: any) {
      setMessage(err.message || 'Error');
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {message && <div className="text-sm text-green-600">{message}</div>}
  {jobs.map((job) => (
        <div key={job.id} className="p-4 border rounded-lg flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{job.description}</p>
            <p className="text-sm text-gray-500 mt-2">{job.location} • {job.recruiter?.name ?? '—'}</p>
          </div>
            <div className="flex flex-col items-end gap-3">
            <div className="text-sm text-gray-700">{job.salary ? `$${job.salary}` : '—'}</div>
            <button disabled={loadingId === job.id || (appliedJobIds ?? []).includes(job.id)} onClick={() => apply(job.id)} className="px-3 py-1 bg-indigo-600 text-white rounded">{(appliedJobIds ?? []).includes(job.id) ? 'Applied' : (loadingId === job.id ? 'Applying...' : 'Apply')}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
