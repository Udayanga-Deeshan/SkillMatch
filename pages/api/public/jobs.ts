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
    
    // Get category stats using raw queries to avoid TypeScript cache issues
    const categoryStats = await Promise.all([
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Job" WHERE category = 'IT_SOFTWARE'`,
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Job" WHERE category = 'SALES_MARKETING'`,
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Job" WHERE category = 'FINANCE_ACCOUNTING'`,
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Job" WHERE category = 'HR_ADMINISTRATION'`,
      prisma.$queryRaw<[{count: bigint}]>`SELECT COUNT(*) as count FROM "Job" WHERE category = 'ENGINEERING_MANUFACTURING'`
    ]);
    
    const categories = [
      { 
        name: 'Information Technology (IT) & Software', 
        count: Number(categoryStats[0][0]?.count || 0)
      },
      { 
        name: 'Sales & Marketing', 
        count: Number(categoryStats[1][0]?.count || 0)
      },
      { 
        name: 'Finance & Accounting', 
        count: Number(categoryStats[2][0]?.count || 0)
      },
      { 
        name: 'Human Resources (HR) & Administration', 
        count: Number(categoryStats[3][0]?.count || 0)
      },
      { 
        name: 'Engineering & Manufacturing', 
        count: Number(categoryStats[4][0]?.count || 0)
      },
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