import { getSession } from "@/lib/session";
import { agent } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

async function registerApp(formData: FormData) {
  "use server";
  const session = await getSession(true);
  if (!session) return;

  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  const { ok, data } = await agent<{
    token?: string;
    error?: string;
    install?: unknown;
  }>("/api/v1/tenant/apps", {
    method: "POST",
    token: session.token,
    body: JSON.stringify({ name, url }),
  });

  if (!ok) {
    redirect(`/dashboard/apps/new?error=${encodeURIComponent(data.error ?? "failed")}`);
  }

  // Redirect with token in URL (shown once, then gone)
  redirect(`/dashboard/apps/new/success?token=${encodeURIComponent(data.token ?? "")}&name=${encodeURIComponent(name)}`);
}

export default async function NewAppPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await getSession(true);
  const params = await searchParams;

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
          <span className="font-semibold">Register app</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Register a new app</h1>
        <p className="text-gray-400 mb-8">
          Jarvis will poll the URL every 15-60 min (depending on your plan) to check its health.
        </p>

        <form action={registerApp} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">App name</label>
            <input
              name="name"
              required
              placeholder="my-api"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Only letters, numbers, and dashes. Used as identifier.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Health endpoint URL</label>
            <input
              name="url"
              required
              type="url"
              placeholder="https://api.mycompany.com/jarvis/health"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              Must return JSON matching the Jarvis health schema. If you haven&apos;t set this up yet, use our SDK (bottom).
            </p>
          </div>

          {params.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">
              {params.error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-medium py-3 rounded-lg transition"
          >
            Register app
          </button>
        </form>

        <div className="mt-10 bg-white/5 border border-white/10 rounded-xl p-5">
          <h3 className="font-semibold mb-3">Don&apos;t have /jarvis/health yet?</h3>
          <p className="text-sm text-gray-400 mb-4">Install our SDK — 3 minutes setup:</p>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Laravel</div>
              <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs">
                composer require telehost/jarvis-client
              </code>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Node.js</div>
              <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs">
                npm install @telehost/jarvis-client
              </code>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
