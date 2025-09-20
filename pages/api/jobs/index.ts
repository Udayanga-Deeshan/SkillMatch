import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const jobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description must be less than 5000 characters'),
  location: z.string().min(1, 'Location is required').max(100, 'Location must be less than 100 characters'),
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  salary: z.number().min(0, 'Salary must be positive').nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions as any) as any;
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (session.user.role !== 'RECRUITER') {
      return res.status(403).json({ error: 'Forbidden: Only recruiters can manage jobs' });
    }

    switch (req.method) {
      case 'GET':
        return await getJobs(req, res, session.user.id);
      case 'POST':
        return await createJob(req, res, session.user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Jobs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getJobs(req: NextApiRequest, res: NextApiResponse, recruiterId: string) {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId },
      include: {
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const totalJobs = jobs.length;
    const totalApplications = jobs.reduce((sum, job) => sum + job._count.applications, 0);
    const activeJobs = totalJobs; // All jobs are considered active for now
    const recentJobs = jobs.filter(job => {
      const jobDate = new Date(job.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return jobDate >= weekAgo;
    }).length;

    const stats = {
      totalJobs,
      totalApplications,
      activeJobs,
      recentJobs,
    };

    return res.status(200).json({ jobs, stats });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}

async function createJob(req: NextApiRequest, res: NextApiResponse, recruiterId: string) {
  try {
    const validatedData = jobSchema.parse(req.body);
    
    const job = await prisma.job.create({
      data: {
        ...validatedData,
        recruiterId,
      },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    return res.status(201).json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      });
    }
    console.error('Error creating job:', error);
    return res.status(500).json({ error: 'Failed to create job' });
  }
}