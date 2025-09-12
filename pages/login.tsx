"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [justRegistered, setJustRegistered] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered')) {
        setJustRegistered(true);
        // Clean the URL (optional)
        const url = window.location.pathname;
        window.history.replaceState({}, '', url);
      }
    }
  }, []);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm({
    resolver: zodResolver(schema)
  });

  async function onSubmit(values: any) {
    try {
      const res = await signIn('credentials', { email: values.email, password: values.password, redirect: true, callbackUrl: '/' });
      if ((res as any)?.error) setError('root', { message: 'Invalid credentials' });
    } catch (e) {
      setError('root', { message: 'Login failed' });
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 mx-auto max-w-4xl">
      <nav className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
            SM
          </div>
          <span className="font-semibold text-lg">SkillMatch</span>
        </div>
        <div>
          <a
            href="/register"
            className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded"
          >
            Create account
          </a>
        </div>
      </nav>

      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="text-gray-600">
            Sign in to access jobs, applications, and your dashboard.
          </p>
          {justRegistered && (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
              Account created successfully. Please sign in.
            </div>
          )}
        </div>

        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 bg-white p-6 rounded-lg shadow-md"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register("email")}
                className="mt-1 w-full border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="mt-1 w-full border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
            <div className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <a href="/register" className="text-indigo-600 hover:underline">
                Create one
              </a>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
