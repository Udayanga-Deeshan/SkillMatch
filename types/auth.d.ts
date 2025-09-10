export type Role = 'ADMIN' | 'RECRUITER' | 'CANDIDATE';

export type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: Role | null;
};
