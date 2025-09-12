import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../pages/api/auth/[...nextauth]';
import { redirect } from 'next/navigation';

export default async function RoleRedirectPage() {
  const session = await getServerSession(authOptions as any) as any;
  if (!session?.user) {
    redirect('/login');
  }
  const role = session.user.role;
  if (role === 'CANDIDATE') redirect('/candidate/dashboard');
  if (role === 'RECRUITER') redirect('/recruiter/dashboard');
  redirect('/login');
}