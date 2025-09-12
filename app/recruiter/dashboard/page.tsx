import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import Navbar from '../../../components/Navbar';

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'RECRUITER') redirect('/unauthorized');

  const jobs = await prisma.job.findMany({
    where: { recruiterId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-semibold mb-4">Recruiter dashboard</h1>
      <p className="text-gray-600 mb-6">Manage your job postings.</p>
      <ul className="space-y-3">
  {jobs.map((job: any) => (
          <li key={job.id} className="p-4 border rounded-md">
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-gray-600">{job.location}</div>
          </li>
        ))}
        {jobs.length === 0 && <li className="text-gray-500">No jobs posted yet.</li>}
      </ul>
    </div>
  );
}