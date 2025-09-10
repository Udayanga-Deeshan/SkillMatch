export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 mx-auto max-w-6xl">
      <nav className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">SM</div>
          <span className="font-semibold text-lg">SkillMatch</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-700 hover:underline">Jobs</a>
          <a href="#" className="text-gray-700 hover:underline">Companies</a>
          <a href="#" className="text-gray-700 hover:underline">Resources</a>
          <a href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Login</a>
        </div>
      </nav>

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
            <div className="w-full h-56 bg-gray-100 rounded flex items-center justify-center text-gray-400">Illustration</div>
          </div>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Popular categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Engineering</p>
              <p className="text-sm text-gray-500">124 jobs</p>
            </div>
            <div className="text-indigo-600 font-semibold">›</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Design</p>
              <p className="text-sm text-gray-500">41 jobs</p>
            </div>
            <div className="text-indigo-600 font-semibold">›</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Product</p>
              <p className="text-sm text-gray-500">22 jobs</p>
            </div>
            <div className="text-indigo-600 font-semibold">›</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Marketing</p>
              <p className="text-sm text-gray-500">37 jobs</p>
            </div>
            <div className="text-indigo-600 font-semibold">›</div>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">Sales</p>
              <p className="text-sm text-gray-500">19 jobs</p>
            </div>
            <div className="text-indigo-600 font-semibold">›</div>
          </div>
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
          <article className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Senior Frontend Engineer</h3>
              <p className="text-sm text-gray-500 mt-1">Nebula Labs • Remote</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">Full-time</span>
              <a className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm" href="#">Apply</a>
            </div>
          </article>

          <article className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Product Designer</h3>
              <p className="text-sm text-gray-500 mt-1">Orbit Co. • New York, NY</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">Contract</span>
              <a className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm" href="#">Apply</a>
            </div>
          </article>

          <article className="p-4 bg-white rounded-lg shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Data Scientist</h3>
              <p className="text-sm text-gray-500 mt-1">Insight AI • San Francisco, CA</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 text-sm bg-gray-100 rounded-full">Full-time</span>
              <a className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm" href="#">Apply</a>
            </div>
          </article>
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
