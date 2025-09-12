"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
// Removed auto sign-in; we'll redirect user to login page after successful registration.

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) as any, defaultValues: { role: 'CANDIDATE' } });

  async function onSubmit(values: { name: string; email: string; password: string; role: 'CANDIDATE' | 'RECRUITER' }) {
    const res = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    if (!res.ok) {
      let msg = 'Registration failed';
      try {
        const err = await res.json();
        if (err?.error) msg = typeof err.error === 'string' ? err.error : 'Invalid data';
      } catch {}
      alert(msg);
      return;
    }
    // Redirect to login with a flag so we can show a success message there
    router.replace('/login?registered=1');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">SM</div>
          <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">Sign up as a candidate or recruiter to get started.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input {...register('name')} placeholder="Jane Doe" className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input {...register('email')} placeholder="you@example.com" className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" {...register('password')} placeholder="At least 6 characters" className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select {...register('role')} className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="CANDIDATE">Candidate</option>
              <option value="RECRUITER">Recruiter</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          <div>
            <button type="submit" disabled={isSubmitting} className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700 disabled:opacity-60">Create account</button>
          </div>

          <p className="text-center text-sm text-gray-600">Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Sign in</a></p>
        </form>
      </div>
    </main>
  );
}
