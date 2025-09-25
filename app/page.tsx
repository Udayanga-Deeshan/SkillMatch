import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import Navbar from '../components/Navbar';
import Image from 'next/image';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'CANDIDATE' | 'RECRUITER';
}

interface Session {
  user?: User;
  expires: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  company: string;
  salary: number | null;
  createdAt: string;
  recruiter: {
    id: string;
    name: string;
  };
  _count: {
    applications: number;
  };
}

interface Category {
  name: string;
  count: number;
}

interface PublicJobsData {
  jobs: Job[];
  categories: Category[];
  totalJobs: number;
}

async function getPublicJobs(): Promise<PublicJobsData> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/public/jobs`, {
      cache: 'no-store' // Ensure we get fresh data
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    // Return fallback data
    return {
      jobs: [],
      categories: [
        { name: 'Engineering', count: 0 },
        { name: 'Design', count: 0 },
        { name: 'Product', count: 0 },
        { name: 'Marketing', count: 0 },
        { name: 'Sales', count: 0 },
      ],
      totalJobs: 0
    };
  }
}

export default async function HomePage() {
  const session = (await getServerSession(authOptions)) as Session | null;
  const user = session?.user;
  const { jobs, categories, totalJobs } = await getPublicJobs();

  return (
    <main className="min-h-screen px-6 py-12 mx-auto max-w-6xl">
  <Navbar />

      <header className="mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Find your next role that fits your skills
            </h1>
            <p className="mt-4 text-gray-600 max-w-xl">
              Explore curated job listings from top companies. Filter by
              skills, location, and experience level. Get alerted when new
              roles match you.
            </p>

            <div className="mt-6 flex gap-3">
              <a href="#featured" className="px-5 py-3 bg-indigo-600 text-white rounded-md">Browse jobs</a>
              <a href="#categories" className="px-5 py-3 border border-gray-300 rounded-md text-gray-700">View categories</a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-6 flex items-center justify-center">
            <div className="relative w-full h-56 rounded overflow-hidden">
              <Image
                src="/hero.png"
                alt="Job search illustration"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Popular categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <div key={category.name} className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-gray-500">{category.count} jobs</p>
              </div>
              <div className="text-indigo-600 font-semibold">›</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Featured roles</h2>
          <a href="#" className="text-indigo-600 hover:underline text-sm">
            View all
          </a>
        </div>

        <div className="space-y-4">
          {jobs.length > 0 ? (
            jobs.slice(0, 5).map((job) => (
              <article key={job.id} className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{job.company} • {job.location}</p>
                  {job.salary && (
                    <p className="text-sm text-green-600 mt-1">${job.salary.toLocaleString()}/year</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">Full-time</span>
                  <a className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm" href="#">
                    Apply
                  </a>
                </div>
              </article>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No jobs available at the moment.</p>
              <p className="text-sm mt-2">Check back later for new opportunities!</p>
            </div>
          )}
        </div>
      </section>

      <footer className="border-t pt-6 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <strong className="text-gray-900">SkillMatch</strong>
            <div className="mt-1">© 2025 SkillMatch, Inc.</div>
          </div>
          <nav className="flex gap-4">
            <a href="#" className="hover:underline">About</a>
            <a href="#" className="hover:underline">Privacy</a>
            <a href="#" className="hover:underline">Contact</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
