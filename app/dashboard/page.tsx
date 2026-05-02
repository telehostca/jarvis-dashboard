import { getSession } from "@/lib/session";
import { agent } from "@/lib/api";
import { Bot, LogOut, AppWindow, Users, Bell, GitPullRequest, FileBarChart2 } from "lucide-react";
import Link from "next/link";
import { signout } from "@/lib/session";

interface TenantInfo {
  tenant: { id: string; name: string; slug: string; plan: string; status: string };
  limits: { max_apps: number; max_recipients: number; max_members: number; cron_interval_minutes: number };
  usage: { apps_count: number; recipients_count: number; members_count: number };
  apps: Array<{ name: string; url: string; created_at: number }>;
  recipients: string[];
  members: Array<{ phone: string; role: string }>;
}

export default async function DashboardPage() {
  const session = await getSession(true);
  if (!session) return null; // redirected

  const { ok, status, data: info, raw } = await agent<TenantInfo & { error?: string; message?: string }>(
    "/api/v1/tenant/me",
    { token: session.token }
  );

  if (!ok || !info?.tenant) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white/5 border border-red-500/30 rounded-2xl p-8 text-center">
          <h1 className="text-xl font-bold mb-2">Could not load dashboard</h1>
          <p className="text-gray-400 text-sm mb-1">
            The agent responded with HTTP {status}.
          </p>
          <p className="text-red-300 text-sm font-mono break-words mb-4">
            {info?.message || info?.error || raw?.slice(0, 200) || "No details"}
          </p>
          <form action={signout}>
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium px-4 py-2 rounded-lg"
            >
              Sign out and retry
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-md bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Jarvis</span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-sm text-gray-300">{info.tenant.name}</span>
            <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full">
              {info.tenant.plan}
            </span>
          </div>
          <form action={signout}>
            <button
              type="submit"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {info.tenant.name}</h1>
        <p className="text-gray-400 mb-6">Manage your apps, alerts, and team.</p>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/dashboard/auto-fixes"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-full px-4 py-1.5 text-sm transition"
          >
            <GitPullRequest className="w-4 h-4 text-cyan-400" />
            <span>Auto-fixes</span>
            <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-full">beta</span>
          </Link>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-full px-4 py-1.5 text-sm transition"
          >
            <FileBarChart2 className="w-4 h-4 text-cyan-400" />
            <span>Weekly reports</span>
            <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-full">beta</span>
          </Link>
        </div>

        {/* Usage summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <StatCard
            icon={<AppWindow className="w-5 h-5" />}
            label="Apps monitored"
            value={`${info.usage.apps_count} / ${info.limits.max_apps}`}
          />
          <StatCard
            icon={<Bell className="w-5 h-5" />}
            label="Alert recipients"
            value={`${info.usage.recipients_count} / ${info.limits.max_recipients}`}
          />
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Team members"
            value={`${info.usage.members_count} / ${info.limits.max_members}`}
          />
        </div>

        {/* Apps */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your apps</h2>
            <Link
              href="/dashboard/apps/new"
              className="bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              + Register app
            </Link>
          </div>

          {info.apps.length === 0 ? (
            <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-10 text-center">
              <AppWindow className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No apps yet. Register your first app to start monitoring.</p>
              <Link
                href="/dashboard/apps/new"
                className="inline-block bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-medium px-4 py-2 rounded-lg"
              >
                Get started
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {info.apps.map((app) => (
                <div
                  key={app.name}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{app.name}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{app.url}</div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Added {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recipients */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Alert recipients</h2>
            <Link
              href="/dashboard/recipients/new"
              className="text-sm text-cyan-400 hover:underline"
            >
              + Add recipient
            </Link>
          </div>
          {info.recipients.length === 0 ? (
            <div className="text-gray-500 text-sm">No recipients configured.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {info.recipients.map((phone) => (
                <div
                  key={phone}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-mono"
                >
                  +{phone}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Members */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Team members</h2>
            <Link
              href="/dashboard/members/new"
              className="text-sm text-cyan-400 hover:underline"
            >
              + Invite member
            </Link>
          </div>
          <div className="space-y-2">
            {info.members.map((m) => (
              <div
                key={m.phone}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-semibold">
                    {m.phone.slice(-2)}
                  </div>
                  <div>
                    <div className="text-sm font-mono">+{m.phone}</div>
                    <div className="text-xs text-gray-500 capitalize">{m.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 text-gray-400 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
