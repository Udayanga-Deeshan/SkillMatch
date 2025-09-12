"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { authAtom } from '../atoms/authAtom';

export default function AuthInit() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const setAuth = useSetAtom(authAtom);

  useEffect(() => {
    if (session?.user) {
      const role = (session.user as any).role ?? null;
      setAuth({ id: (session.user as any).id ?? '', name: session.user.name ?? null, email: session.user.email ?? null, role });
  // Removed auto-redirect from home/login to dashboards so home stays publicly viewable.
    } else {
      setAuth(null);
    }
  }, [session, setAuth, pathname, router]);

  return null;
}
