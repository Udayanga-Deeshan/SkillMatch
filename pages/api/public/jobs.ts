import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get featured jobs (limit to recent ones for homepage)
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
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to 10 jobs for homepage
    });

    // Get category stats (simplified for homepage)
    const totalJobs = await prisma.job.count();
    
    // Group jobs by location for category display
    const categories = [
      { name: 'Engineering', count: await prisma.job.count({ where: { title: { contains: 'Engineer', mode: 'insensitive' } } }) },
      { name: 'Design', count: await prisma.job.count({ where: { title: { contains: 'Design', mode: 'insensitive' } } }) },
      { name: 'Product', count: await prisma.job.count({ where: { title: { contains: 'Product', mode: 'insensitive' } } }) },
      { name: 'Marketing', count: await prisma.job.count({ where: { title: { contains: 'Marketing', mode: 'insensitive' } } }) },
      { name: 'Sales', count: await prisma.job.count({ where: { title: { contains: 'Sales', mode: 'insensitive' } } }) },
    ];

    return res.status(200).json({ 
      jobs, 
      categories,
      totalJobs 
    });
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}