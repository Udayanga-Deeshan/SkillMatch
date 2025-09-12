import React from 'react';
import { prisma } from '../../../lib/prisma';
import CandidateDashboardClient from '../../../components/CandidateDashboardClient';
import AuthInit from '../../../components/AuthInit';
import Navbar from '../../../components/Navbar';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';

type JobForClient = {
  id: string;
  title: string;
  description: string;
  location: string;
  salary: number | null;
  recruiter: { id: string; name: string } | null;
};

export default async function CandidateDashboardPage() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'CANDIDATE') redirect('/unauthorized');

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: { recruiter: { select: { id: true, name: true } } },
  });

  const safeJobs: JobForClient[] = jobs.map((j: any) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    location: j.location,
    salary: j.salary ?? null,
    recruiter: j.recruiter ? { id: j.recruiter.id, name: j.recruiter.name } : null,
  }));

  // fetch candidate's applications
  const apps = await prisma.application.findMany({ where: { candidateId: session.user.id }, include: { job: { select: { id: true } } } });
  const appliedJobIds = apps.map((a: any) => a.jobId);

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-semibold mb-4">Candidate dashboard</h1>
      <p className="text-gray-600 mb-6">Browse available roles and apply directly.</p>
      <AuthInit />
      <CandidateDashboardClient jobs={safeJobs} appliedJobIds={appliedJobIds} />
      <div className="mt-8 text-xs text-gray-400">Debug: role={session.user.role}</div>
    </div>
  );
}
