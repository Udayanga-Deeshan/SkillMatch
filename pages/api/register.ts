import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createUser } from '../../lib/auth';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CANDIDATE', 'RECRUITER']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const parsed = schema.parse(req.body);
    const existing = await (await import('../../lib/prisma')).prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return res.status(409).json({ error: 'User already exists' });
    const user = await createUser(parsed as any);
    return res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (err: any) {
    if (err?.name === 'ZodError' || err?.issues) return res.status(422).json({ error: err.errors ?? err.issues });
    return res.status(500).json({ error: 'Server error' });
  }
}
