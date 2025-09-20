import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(['PENDING', 'SHORTLISTED', 'REJECTED', 'HIRED'])
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions as any) as any;
    
    if (!session?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (session.user.role !== 'RECRUITER') {
      return res.status(403).json({ error: 'Forbidden: Only recruiters can update application status' });
    }

    const { id: applicationId } = req.query;

    if (typeof applicationId !== 'string') {
      return res.status(400).json({ error: 'Invalid application ID' });
    }

    switch (req.method) {
      case 'PATCH':
        return await updateApplicationStatus(req, res, applicationId, session.user.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Application status API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateApplicationStatus(
  req: NextApiRequest, 
  res: NextApiResponse, 
  applicationId: string, 
  recruiterId: string
) {
  try {
    const validatedData = statusUpdateSchema.parse(req.body);
    
    // First, verify that this application belongs to a job created by this recruiter
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          recruiterId: recruiterId
        }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            recruiterId: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found or not authorized' });
    }

    // Update the application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: validatedData.status },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true
          }
        }
      }
    });

    return res.status(200).json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      });
    }
    console.error('Error updating application status:', error);
    return res.status(500).json({ error: 'Failed to update application status' });
  }
}