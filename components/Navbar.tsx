"use client";

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const user = session?.user as any | undefined;
  const role = user?.role;

  return (
    <nav className="flex items-center justify-between mb-10">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">SM</div>
          <span className="font-semibold text-lg">SkillMatch</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="#" className="text-gray-700 hover:underline">Jobs</Link>
        <Link href="#" className="text-gray-700 hover:underline">Companies</Link>
        <Link href="#" className="text-gray-700 hover:underline">Resources</Link>
        {!user && (
          <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Login</Link>
        )}
        {user && (
          <>
            <span className="text-gray-600 hidden sm:inline">Hi {user.name?.split(' ')[0] || 'User'}</span>
            {role === 'CANDIDATE' && (
              <Link href="/candidate/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Dashboard</Link>
            )}
            {role === 'RECRUITER' && (
              <Link href="/recruiter/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Dashboard</Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
