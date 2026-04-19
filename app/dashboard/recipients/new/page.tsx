import { getSession } from "@/lib/session";
import { agent } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot } from "lucide-react";

async function addRecipient(formData: FormData) {
  "use server";
  const session = await getSession(true);
  if (!session) return;

  const phone = String(formData.get("phone") ?? "").trim();

  const { ok, data } = await agent<{ error?: string }>("/api/v1/tenant/recipients", {
    method: "POST",
    token: session.token,
    body: JSON.stringify({ phone }),
  });

  if (!ok) {
    redirect(`/dashboard/recipients/new?error=${encodeURIComponent(data.error ?? "failed")}`);
  }

  redirect("/dashboard");
}

export default async function NewRecipientPage({
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
          <span className="font-semibold">Add alert recipient</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Add alert recipient</h1>
        <p className="text-gray-400 mb-8">
          This phone number will receive Jarvis alerts via WhatsApp when your apps have problems.
        </p>

        <form action={addRecipient} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp number</label>
            <input
              name="phone"
              required
              type="tel"
              placeholder="584121234567"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 font-mono"
            />
            <p className="text-xs text-gray-500 mt-1">
              With country code, no + sign.
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
            Add recipient
          </button>
        </form>
      </div>
    </main>
  );
}
