import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';

const bodySchema = z.object({ jobId: z.string().uuid() });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user) return res.status(401).json({ error: 'Not authenticated' });
  if (session.user.role !== 'CANDIDATE') return res.status(403).json({ error: 'Forbidden' });

  try {
    const { jobId } = bodySchema.parse(req.body);
    // prevent duplicate
  const exists = await prisma.application.findFirst({ where: { jobId, candidateId: session.user.id } });
    if (exists) return res.status(409).json({ error: 'Already applied' });
    // create application
    const application = await prisma.application.create({
      data: {
        jobId,
    candidateId: session.user.id,
      },
    });
    return res.status(201).json({ id: application.id });
  } catch (err: any) {
    if (err?.name === 'ZodError') return res.status(422).json({ error: err.errors ?? err.issues });
    return res.status(500).json({ error: 'Server error' });
  }
}
