import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions as any) as any;
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (session.user.role !== 'CANDIDATE') {
      return res.status(403).json({ error: 'Forbidden: Only candidates can access this endpoint' });
    }

    switch (req.method) {
      case 'GET':
        return await getApplications(req, res, session.user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Candidate applications API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getApplications(req: NextApiRequest, res: NextApiResponse, candidateId: string) {
  try {
    const applications = await prisma.application.findMany({
      where: { candidateId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            salary: true,
            recruiter: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'PENDING').length,
      shortlistedApplications: applications.filter(app => app.status === 'SHORTLISTED').length,
      rejectedApplications: applications.filter(app => app.status === 'REJECTED').length,
      hiredApplications: applications.filter(app => app.status === 'HIRED').length,
      savedJobs: 0, // TODO: Implement saved jobs feature
    };

    return res.status(200).json({ applications, stats });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
}