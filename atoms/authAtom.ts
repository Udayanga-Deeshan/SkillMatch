import { atom } from 'jotai';

export type AuthUser = {
  id: string;
  name: string | null;
  email: string | null;
  role?: string | null;
};

export const authAtom = atom<AuthUser | null>(null);
