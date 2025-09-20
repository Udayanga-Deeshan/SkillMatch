import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { z } from 'zod';

const jobUpdateSchema = z.object({
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

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid job ID' });
    }

    switch (req.method) {
      case 'GET':
        return await getJob(req, res, id, session.user.id);
      case 'PUT':
        return await updateJob(req, res, id, session.user.id);
      case 'DELETE':
        return await deleteJob(req, res, id, session.user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Job API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getJob(req: NextApiRequest, res: NextApiResponse, jobId: string, recruiterId: string) {
  try {
    const job = await prisma.job.findFirst({
      where: { 
        id: jobId,
        recruiterId 
      },
      include: {
        _count: {
          select: { applications: true }
        },
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
}

async function updateJob(req: NextApiRequest, res: NextApiResponse, jobId: string, recruiterId: string) {
  try {
    const validatedData = jobUpdateSchema.parse(req.body);
    
    // Check if job exists and belongs to the recruiter
    const existingJob = await prisma.job.findFirst({
      where: { 
        id: jobId,
        recruiterId 
      }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: validatedData,
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    return res.status(200).json(updatedJob);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      });
    }
    console.error('Error updating job:', error);
    return res.status(500).json({ error: 'Failed to update job' });
  }
}

async function deleteJob(req: NextApiRequest, res: NextApiResponse, jobId: string, recruiterId: string) {
  try {
    // Check if job exists and belongs to the recruiter
    const existingJob = await prisma.job.findFirst({
      where: { 
        id: jobId,
        recruiterId 
      }
    });

    if (!existingJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Delete job (applications will be deleted due to cascade)
    await prisma.job.delete({
      where: { id: jobId }
    });

    return res.status(200).json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return res.status(500).json({ error: 'Failed to delete job' });
  }
}