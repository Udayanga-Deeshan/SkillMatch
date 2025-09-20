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
        return await getJobs(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Candidate jobs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getJobs(req: NextApiRequest, res: NextApiResponse) {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}