import Link from "next/link";
import { CheckCircle2, Copy, Bot, ArrowLeft } from "lucide-react";
import { CopyButton } from "./copy-button";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; name?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const name = params.name ?? "your-app";

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
          <span className="font-semibold">App registered</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-400" />
          <div>
            <h1 className="text-2xl font-bold">App registered!</h1>
            <p className="text-gray-400 text-sm">Now install the SDK in your app.</p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-8">
          <p className="text-sm text-yellow-200">
            ⚠️ <strong>Save this token now — it cannot be retrieved later.</strong>
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <div className="text-xs text-gray-500 mb-2">JARVIS_TOKEN</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs break-all">
              {token}
            </code>
            <CopyButton text={token} />
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Install in your app</h2>

        <div className="space-y-6">
          {/* Laravel */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-red-400">Laravel</span>
            </h3>

            <div className="text-xs text-gray-500 mb-1">1. Install</div>
            <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs mb-3">
              composer require telehost/jarvis-client
            </code>

            <div className="text-xs text-gray-500 mb-1">2. Add to .env</div>
            <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs mb-3 break-all">
              JARVIS_TOKEN={token}
            </code>

            <div className="text-xs text-gray-500 mb-1">3. Publish config</div>
            <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs mb-3">
              php artisan vendor:publish --tag=jarvis-config
            </code>

            <div className="text-xs text-gray-500 mb-1">4. Define metrics in config/jarvis.php</div>
            <pre className="block bg-black/50 text-gray-300 px-3 py-2 rounded font-mono text-xs overflow-x-auto">
{`'metrics' => [
    'users_active' => fn () => User::count(),
    'revenue_today' => fn () => Order::today()->sum('total'),
],`}
            </pre>
          </div>

          {/* Node.js */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-green-400">Node.js (Express)</span>
            </h3>

            <div className="text-xs text-gray-500 mb-1">1. Install</div>
            <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs mb-3">
              npm install @telehost/jarvis-client
            </code>

            <div className="text-xs text-gray-500 mb-1">2. Add to .env</div>
            <code className="block bg-black/50 text-cyan-300 px-3 py-2 rounded font-mono text-xs mb-3 break-all">
              JARVIS_TOKEN={token}
            </code>

            <div className="text-xs text-gray-500 mb-1">3. Mount the route</div>
            <pre className="block bg-black/50 text-gray-300 px-3 py-2 rounded font-mono text-xs overflow-x-auto">
{`import { jarvisHealth } from '@telehost/jarvis-client/express';

app.get('/jarvis/health', jarvisHealth({
  token: process.env.JARVIS_TOKEN!,
  appName: '${name}',
  metrics: {
    users_active: async () => User.count(),
  },
}));`}
            </pre>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-medium py-3 rounded-lg text-center transition"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
