export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-6 max-w-md">You don't have permission to view this page with your current role.</p>
      <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Go Home</a>
    </main>
  );
}