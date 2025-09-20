"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [justRegistered, setJustRegistered] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
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
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (values: any) => {
    // Clear any previous errors
    setLoginError(null);
    setValidationError(null);
    
    try {
      // Validate the form data manually
      const validationResult = schema.safeParse(values);
      
      if (!validationResult.success) {
        // Handle validation errors
        const errorMessages = validationResult.error.issues.map((err: any) => err.message);
        setValidationError(errorMessages.join('. '));
        return;
      }
      
      const validatedData = validationResult.data;
      const res = await signIn('credentials', { 
        email: validatedData.email, 
        password: validatedData.password, 
        redirect: false // Don't redirect automatically to handle errors properly
      });
      
      if (res?.error) {
        // Handle different types of authentication errors
        switch (res.error) {
          case 'CredentialsSignin':
            setLoginError('Invalid email or password. Please check your credentials and try again.');
            break;
          case 'Configuration':
            setLoginError('There was a configuration error. Please contact support.');
            break;
          case 'AccessDenied':
            setLoginError('Access denied. Your account may be suspended or inactive.');
            break;
          case 'Verification':
            setLoginError('Please verify your email address before signing in.');
            break;
          default:
            setLoginError('Login failed. Please try again or contact support if the problem persists.');
        }
        return;
      }
      
      if (res?.ok) {
        // Successful login - redirect to appropriate dashboard
        router.push('/role-redirect');
      } else {
        setLoginError('An unexpected error occurred. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle network and other errors
      if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
        setLoginError('Network error. Please check your internet connection and try again.');
      } else if (error.message?.includes('timeout')) {
        setLoginError('Request timed out. Please try again.');
      } else {
        setLoginError('An unexpected error occurred. Please try again or contact support.');
      }
    }
  };

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
          
          {(loginError || validationError) && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  {loginError || validationError}
                </div>
              </div>
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
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
                className="mt-1 w-full border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                placeholder="Enter your email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className="mt-1 w-full border border-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                isSubmitting
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              } text-white`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
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
