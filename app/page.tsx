import Link from "next/link";
import { ArrowRight, Bot, MessageSquare, Shield, Zap, CheckCircle2 } from "lucide-react";
import { JarvisChat } from "@/components/jarvis-chat";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-md sticky top-0 z-50 bg-black/30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">Jarvis</span>
            <span className="text-xs text-cyan-400 ml-1 mt-0.5">by TeleHost</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#features" className="text-gray-400 hover:text-white">Features</Link>
            <Link href="#pricing" className="text-gray-400 hover:text-white">Pricing</Link>
            <Link href="/signin" className="text-gray-400 hover:text-white">Sign in</Link>
            <Link
              href="/signup"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-4 py-2 rounded-lg transition"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-8">
          <Zap className="w-4 h-4" />
          <span>Deployed by TeleHost — the Venezuelan infra company</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
          Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">DevOps team</span>
          <br />on WhatsApp, 24/7
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
          Jarvis is an AI agent that monitors your apps and alerts you via WhatsApp when things go wrong.
          No dashboards. No Grafana. Just an agent that tells you what happened and what to do.
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <Link
            href="/signup"
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-8 py-4 rounded-xl transition flex items-center gap-2 text-lg"
          >
            Start free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl transition text-lg"
          >
            See how it works
          </Link>
        </div>

        {/* Example alert */}
        <div className="max-w-xl mx-auto glow">
          <div className="bg-[#0b141a] border border-white/5 rounded-2xl p-6 text-left shadow-2xl">
            <div className="flex items-center gap-2 mb-3 text-sm text-cyan-400">
              <MessageSquare className="w-4 h-4" />
              <span className="font-mono">Jarvis • +58 412 516 4698</span>
            </div>
            <div className="text-gray-200 space-y-3">
              <p>⚠️ <strong>WA Gateway:</strong> 29 failed jobs in last hour</p>
              <p className="text-sm text-gray-400">
                WA Gateway reports 29 failed webhook deliveries in the last hour (threshold: 20).
                1 WhatsApp instance disconnected on tenant Jarvis (17/18 connected).
              </p>
              <div className="text-sm">
                <p className="font-semibold text-cyan-300 mb-1">Suggested actions:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Check WA Gateway logs for failed job causes</li>
                  <li>• Reconnect the disconnected WhatsApp instance</li>
                </ul>
              </div>
              <div className="text-xs text-gray-600 pt-2 border-t border-white/5">
                <em>Jarvis • new • 2026-04-19 13:41</em>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive demo */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-2">Try it live</h2>
        <p className="text-center text-gray-400 mb-8">
          Ask Jarvis anything. Powered by Claude Haiku 4.5.
        </p>
        <JarvisChat />
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Install in 3 minutes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step
            number="1"
            title="Sign up"
            body="Create your account with magic link. No credit card for free tier."
          />
          <Step
            number="2"
            title="Install our SDK"
            body={<code className="text-cyan-400 text-sm">composer require telehost/jarvis-client</code>}
          />
          <Step
            number="3"
            title="Define your metrics"
            body="5 closures in config/jarvis.php. Jarvis does the rest."
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">Why Jarvis</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Feature
            icon={<Bot className="w-6 h-6" />}
            title="AI-powered, never hallucinates"
            body="Code validates every number before Jarvis says it. If a fact can't be verified in real data, Jarvis says 'I don't know' instead of inventing."
          />
          <Feature
            icon={<MessageSquare className="w-6 h-6" />}
            title="WhatsApp, not dashboards"
            body="You don't have Slack open at 3am. You have WhatsApp. Jarvis lives where you already are."
          />
          <Feature
            icon={<Shield className="w-6 h-6" />}
            title="Evidence-based suggestions"
            body="Every recommendation cites the data that justifies it. No generic 'check your logs' — actionable specifics."
          />
          <Feature
            icon={<Zap className="w-6 h-6" />}
            title="Auto-dedupe, auto-resolve"
            body="One alert per incident. When the problem resolves, Jarvis sends a ✅ resolved message. No spam, no noise."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-4">Pricing</h2>
        <p className="text-center text-gray-400 mb-16">Start free. Upgrade when you need more.</p>
        <div className="grid md:grid-cols-4 gap-4">
          <Plan name="Free" price="$0" apps="1 app" interval="60 min monitoring" recipients="1 recipient" />
          <Plan name="Pro" price="$19" apps="5 apps" interval="30 min monitoring" recipients="3 recipients" featured />
          <Plan name="Business" price="$49" apps="20 apps" interval="15 min monitoring" recipients="10 recipients" />
          <Plan name="Enterprise" price="$199" apps="Unlimited" interval="5 min monitoring" recipients="Unlimited" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-24">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center text-gray-500 text-sm">
          <p>Built by <a href="https://telehost.net" className="text-cyan-400 hover:underline">TeleHost C.A.</a> in Venezuela 🇻🇪</p>
          <p className="mt-2">
            <a href="https://github.com/telehostca/jarvis-client-php" className="hover:text-white mx-2">Laravel SDK</a>
            <a href="https://github.com/telehostca/jarvis-client-node" className="hover:text-white mx-2">Node SDK</a>
            <a href="https://github.com/telehostca/jarvis-agent" className="hover:text-white mx-2">Agent</a>
          </p>
        </div>
      </footer>
    </main>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/30 transition">
      <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div className="text-gray-400">{body}</div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-400 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-2">{title}</h3>
      <p className="text-gray-400">{body}</p>
    </div>
  );
}

function Plan({
  name,
  price,
  apps,
  interval,
  recipients,
  featured,
}: {
  name: string;
  price: string;
  apps: string;
  interval: string;
  recipients: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-6 border ${
        featured
          ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/5 to-transparent relative"
          : "border-white/5 bg-white/5"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-cyan-500 text-black text-xs font-semibold rounded-full">
          POPULAR
        </div>
      )}
      <h3 className="font-semibold text-xl mb-2">{name}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">{price}</span>
        <span className="text-gray-400 text-sm ml-1">/mo</span>
      </div>
      <ul className="space-y-2 text-sm text-gray-400">
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {apps}
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {interval}
        </li>
        <li className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" /> {recipients}
        </li>
      </ul>
    </div>
  );
}
