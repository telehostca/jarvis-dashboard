import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-6 py-3 rounded-lg transition"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
