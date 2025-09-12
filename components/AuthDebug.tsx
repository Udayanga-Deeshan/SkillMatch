"use client";

import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import { authAtom } from '../atoms/authAtom';

export default function AuthDebug() {
  const [auth] = useAtom(authAtom);
  const { data: session } = useSession();

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-sm font-mono" style={{ maxWidth: '400px' }}>
      <div className="mb-2">
        <strong>Auth Atom:</strong>
        <pre className="overflow-auto">{JSON.stringify(auth, null, 2)}</pre>
      </div>
      <div>
        <strong>NextAuth Session:</strong>
        <pre className="overflow-auto">{JSON.stringify(session, null, 2)}</pre>
      </div>
    </div>
  );
}
