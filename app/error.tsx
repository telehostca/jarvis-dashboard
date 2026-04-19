"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-8">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-6 py-3 rounded-lg transition"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
