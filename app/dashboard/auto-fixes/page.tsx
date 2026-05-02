import { getSession } from "@/lib/session";
import Link from "next/link";
import { ArrowLeft, Bot, GitPullRequest, Sparkles } from "lucide-react";

export default async function AutoFixesPage() {
  await getSession(true);

  return (
    <main className="min-h-screen">
      <nav className="border-b border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold">Auto-fixes</span>
          <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-full ml-2">
            beta
          </span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <GitPullRequest className="w-7 h-7 text-cyan-400" />
          <h1 className="text-3xl font-bold">Auto-fixes</h1>
        </div>
        <p className="text-gray-400 mb-10">
          Pull requests proposed by Jarvis to fix recurring issues in your apps.
        </p>

        <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-10 text-center">
          <Sparkles className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold mb-2">Coming soon</h2>
          <p className="text-gray-400 mb-4 max-w-lg mx-auto">
            When an error happens 3+ times in your app, Jarvis can analyze the
            stack trace and open a pull request with a proposed fix on your
            GitHub repo.
          </p>
          <p className="text-xs text-gray-500">
            Requires connecting a GitHub repo per app. Available on Business+ plans.
          </p>
        </div>
      </div>
    </main>
  );
}
